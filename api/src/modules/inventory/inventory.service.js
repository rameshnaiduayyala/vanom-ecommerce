import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { getOrCreateDefaultWarehouse } from "./warehouse.service.js";

/**
 * Synchronize the cached stock on Product/ProductVariant for high-speed catalog browsing.
 * The Inventory table per warehouse remains the definitive single source of truth.
 */
async function syncProductStockCache(tx, productId, variantId) {
  let resolvedProductId = productId;
  if (variantId) {
    const variantTotal = await tx.inventory.aggregate({
      where: { variantId },
      _sum: { quantity: true }
    });
    const totalStock = Math.max(0, variantTotal._sum.quantity || 0);
    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: totalStock },
      select: { id: true, productId: true }
    });
    if (!resolvedProductId) resolvedProductId = updatedVariant.productId;

    if (resolvedProductId) {
      const allVariantsStock = await tx.productVariant.aggregate({
        where: { productId: resolvedProductId },
        _sum: { stock: true }
      });
      await tx.product.update({
        where: { id: resolvedProductId },
        data: { stock: Math.max(0, allVariantsStock._sum.stock || 0) }
      });
    }
  } else if (resolvedProductId) {
    const productTotal = await tx.inventory.aggregate({
      where: { productId: resolvedProductId, variantId: null },
      _sum: { quantity: true }
    });
    const totalStock = Math.max(0, productTotal._sum.quantity || 0);
    await tx.product.update({
      where: { id: resolvedProductId },
      data: { stock: totalStock }
    });
  }
}

/**
 * Finds or creates an Inventory record for a specific warehouse and product/variant.
 * Enforces strict non-ambiguity:
 * - Simple products: productId set, variantId = null
 * - Variable products: variantId set, productId = null
 */
export async function findOrCreateInventory({ organizationId, warehouseId, productId = null, variantId = null, initialQuantity = 0, tx = prisma }) {
  if (!warehouseId) {
    const defaultWarehouse = await getOrCreateDefaultWarehouse(organizationId, tx);
    warehouseId = defaultWarehouse.id;
  }

  // Resolve target product / variant relations
  let cleanProductId = productId;
  let cleanVariantId = variantId;

  if (cleanVariantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: cleanVariantId },
      select: { id: true, productId: true }
    });
    if (!variant) {
      throw new AppError("Product variant not found", HTTP_STATUS.NOT_FOUND, "VARIANT_NOT_FOUND");
    }
    cleanProductId = variant.productId;
  } else if (cleanProductId) {
    const product = await tx.product.findUnique({
      where: { id: cleanProductId },
      include: { variants: true }
    });
    if (!product) {
      throw new AppError("Product not found", HTTP_STATUS.NOT_FOUND, "PRODUCT_NOT_FOUND");
    }
    if (product.type === "VARIABLE" && product.variants?.length > 0) {
      throw new AppError(
        "Variable product requires a specific variant for inventory tracking",
        HTTP_STATUS.BAD_REQUEST,
        "VARIANT_REQUIRED"
      );
    }
    cleanVariantId = null;
  } else {
    throw new AppError("Either productId or variantId is required", HTTP_STATUS.BAD_REQUEST, "PRODUCT_OR_VARIANT_REQUIRED");
  }

  // Search existing inventory
  let inventory = null;
  if (cleanVariantId) {
    inventory = await tx.inventory.findFirst({
      where: { warehouseId, variantId: cleanVariantId }
    });
  } else {
    inventory = await tx.inventory.findFirst({
      where: { warehouseId, productId: cleanProductId, variantId: null }
    });
  }

  if (!inventory) {
    inventory = await tx.inventory.create({
      data: {
        organizationId,
        warehouseId,
        productId: cleanVariantId ? null : cleanProductId,
        variantId: cleanVariantId || null,
        quantity: initialQuantity || 0,
        reservedQuantity: 0,
        reorderLevel: 10,
        reorderQuantity: 20
      },
      include: {
        product: { select: { id: true, name: true, sku: true, basePrice: true } },
        variant: { select: { id: true, name: true, sku: true, attributes: true } },
        warehouse: { select: { id: true, name: true, code: true } }
      }
    });

    if (initialQuantity > 0) {
      await syncProductStockCache(tx, cleanProductId, cleanVariantId);
    }
  }

  return inventory;
}

/**
 * ─── 1. STOCK RESERVATION (Order Checkout / Cart Lock) ─────────────────────────
 * Concurrency-safe: validates availableQuantity >= requested and locks reservation atomically.
 * availableQuantity = quantity - reservedQuantity.
 */
export async function reserveInventory({ organizationId, items, orderId, userId = null, warehouseId = null, tx = null }) {
  const runner = async (dbTx) => {
    // Idempotency check: if order already reserved, do not reserve again
    if (orderId) {
      const order = await dbTx.order.findUnique({
        where: { id: orderId },
        select: { id: true, inventoryReserved: true }
      });
      if (order?.inventoryReserved) {
        return { success: true, alreadyReserved: true, orderId };
      }
    }

    const defaultWarehouse = warehouseId
      ? { id: warehouseId }
      : await getOrCreateDefaultWarehouse(organizationId, dbTx);

    const reservations = [];

    for (const item of items) {
      const requestedQty = Number(item.quantity || 1);
      if (requestedQty <= 0) continue;

      const pId = item.productId || null;
      const vId = item.variantId || null;

      // Lock and retrieve current inventory
      const inv = await findOrCreateInventory({
        organizationId,
        warehouseId: defaultWarehouse.id,
        productId: pId,
        variantId: vId,
        tx: dbTx
      });

      const currentAvailable = inv.quantity - inv.reservedQuantity;
      if (currentAvailable < requestedQty) {
        const itemLabel = inv.variant?.name || inv.product?.name || `Item ${pId || vId}`;
        throw new AppError(
          `Insufficient stock available for ${itemLabel}. Requested: ${requestedQty}, Available: ${Math.max(0, currentAvailable)}`,
          HTTP_STATUS.BAD_REQUEST,
          "INSUFFICIENT_STOCK"
        );
      }

      // Atomic reservation increment
      const updated = await dbTx.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: { increment: requestedQty }
        }
      });

      // Audit Trail Transaction
      await dbTx.inventoryTransaction.create({
        data: {
          organizationId,
          inventoryId: inv.id,
          type: "RESERVATION",
          quantity: requestedQty,
          previousQuantity: inv.quantity,
          newQuantity: inv.quantity,
          previousReservedQuantity: inv.reservedQuantity,
          newReservedQuantity: updated.reservedQuantity,
          referenceId: orderId || null,
          referenceType: "ORDER",
          reason: "Order checkout reservation lock",
          createdById: userId
        }
      });

      reservations.push({
        inventoryId: inv.id,
        productId: inv.productId,
        variantId: inv.variantId,
        quantity: requestedQty,
        available: updated.quantity - updated.reservedQuantity
      });
    }

    if (orderId) {
      await dbTx.order.update({
        where: { id: orderId },
        data: {
          inventoryReserved: true,
          warehouseId: defaultWarehouse.id
        }
      });
    }

    return { success: true, orderId, reservations };
  };

  return tx ? runner(tx) : prisma.$transaction(runner);
}

/**
 * ─── 2. RELEASE RESERVATION (Payment Failed / Order Cancelled) ────────────────
 * Idempotent: releases reserved quantity back to available pool.
 */
export async function releaseInventory(orderIdOrOptions, maybeOptions = {}) {
  const options =
    typeof orderIdOrOptions === "object" && orderIdOrOptions !== null
      ? orderIdOrOptions
      : { orderId: orderIdOrOptions, ...maybeOptions };

  const { organizationId, orderId, reason = "Payment failed or order cancelled", userId = null, tx = null } = options;

  const runner = async (dbTx) => {
    if (!orderId) {
      throw new AppError("Order ID is required to release reservation", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
    }

    const order = await dbTx.order.findUnique({
      where: { id: orderId },
      select: { id: true, organizationId: true, inventoryReserved: true, inventoryDeducted: true }
    });

    // Idempotency: If already deducted or not reserved, nothing to release
    if (!order || !order.inventoryReserved || order.inventoryDeducted) {
      return { success: true, alreadyReleased: true, orderId, message: "Reservation already released or not active" };
    }

    const resolvedOrgId = organizationId || order.organizationId;

    // Find all reservation transactions for this order
    const reservations = await dbTx.inventoryTransaction.findMany({
      where: {
        ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
        referenceId: orderId,
        referenceType: "ORDER",
        type: "RESERVATION"
      }
    });

    for (const res of reservations) {
      const inv = await dbTx.inventory.findUnique({ where: { id: res.inventoryId } });
      if (!inv) continue;

      const releaseQty = Math.min(inv.reservedQuantity, res.quantity);
      if (releaseQty <= 0) continue;

      const updated = await dbTx.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: { decrement: releaseQty }
        }
      });

      await dbTx.inventoryTransaction.create({
        data: {
          organizationId: inv.organizationId,
          inventoryId: inv.id,
          type: "RELEASE",
          quantity: releaseQty,
          previousQuantity: inv.quantity,
          newQuantity: inv.quantity,
          previousReservedQuantity: inv.reservedQuantity,
          newReservedQuantity: updated.reservedQuantity,
          referenceId: orderId,
          referenceType: "ORDER",
          reason,
          createdById: userId
        }
      });
    }

    await dbTx.order.update({
      where: { id: orderId },
      data: { inventoryReserved: false }
    });

    return { success: true, orderId, released: true };
  };

  return tx ? runner(tx) : prisma.$transaction(runner);
}

/**
 * ─── 3. DEDUCT INVENTORY (Stripe Payment Success / Order Confirmed) ─────────────
 * Permanent stock reduction: quantity -= Q, reservedQuantity -= Q, creates SALE transaction.
 * Idempotent: checks order.inventoryDeducted flag.
 */
export async function deductInventory(orderIdOrOptions, maybeOptions = {}) {
  const options =
    typeof orderIdOrOptions === "object" && orderIdOrOptions !== null
      ? orderIdOrOptions
      : { orderId: orderIdOrOptions, ...maybeOptions };

  const { organizationId, orderId, userId = null, createdById = null, notes = null, tx = null } = options;

  const runner = async (dbTx) => {
    if (!orderId) {
      throw new AppError("Order ID is required to deduct inventory", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
    }

    const order = await dbTx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new AppError("Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
    }

    // Idempotency: do not deduct twice
    if (order.inventoryDeducted) {
      return { success: true, alreadyDeducted: true, orderId };
    }

    const resolvedOrgId = organizationId || order.organizationId;
    const actorId = userId || createdById || null;

    // If order was not yet reserved, reserve first
    if (!order.inventoryReserved) {
      await reserveInventory({
        organizationId: resolvedOrgId,
        items: order.items,
        orderId,
        userId: actorId,
        warehouseId: order.warehouseId,
        tx: dbTx
      });
    }

    // Retrieve active reservation transactions
    const reservations = await dbTx.inventoryTransaction.findMany({
      where: {
        ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
        referenceId: orderId,
        referenceType: "ORDER",
        type: "RESERVATION"
      }
    });

    for (const res of reservations) {
      const inv = await dbTx.inventory.findUnique({ where: { id: res.inventoryId } });
      if (!inv) continue;

      const deductQty = res.quantity;
      const nextQty = Math.max(0, inv.quantity - deductQty);
      const nextReserved = Math.max(0, inv.reservedQuantity - deductQty);

      await dbTx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: nextQty,
          reservedQuantity: nextReserved
        }
      });

      await dbTx.inventoryTransaction.create({
        data: {
          organizationId: inv.organizationId,
          inventoryId: inv.id,
          type: "SALE",
          quantity: deductQty,
          previousQuantity: inv.quantity,
          newQuantity: nextQty,
          previousReservedQuantity: inv.reservedQuantity,
          newReservedQuantity: nextReserved,
          referenceId: orderId,
          referenceType: "ORDER",
          reason: notes || "Payment verified - stock deducted",
          createdById: actorId || userId
        }
      });

      await syncProductStockCache(dbTx, inv.productId, inv.variantId);
    }

    await dbTx.order.update({
      where: { id: orderId },
      data: {
        inventoryDeducted: true,
        inventoryReserved: false,
        status: order.status === "PENDING" ? "CONFIRMED" : order.status
      }
    });

    return { success: true, orderId, deducted: true };
  };

  return tx ? runner(tx) : prisma.$transaction(runner);
}

/**
 * ─── 4. PURCHASE / STOCK RECEIVING ──────────────────────────────────────────
 * Receives incoming purchase order or stock batch into a warehouse.
 */
export async function receiveInventory({
  organizationId,
  warehouseId,
  productId = null,
  variantId = null,
  quantity,
  supplier = null,
  referenceNumber = null,
  notes = null,
  userId = null
}) {
  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    throw new AppError("Quantity received must be a positive integer", HTTP_STATUS.BAD_REQUEST, "INVALID_QUANTITY");
  }

  return prisma.$transaction(async (tx) => {
    const inv = await findOrCreateInventory({
      organizationId,
      warehouseId,
      productId,
      variantId,
      tx
    });

    const previousQuantity = inv.quantity;
    const newQuantity = previousQuantity + qty;

    const updated = await tx.inventory.update({
      where: { id: inv.id },
      data: { quantity: newQuantity },
      include: {
        warehouse: true,
        product: true,
        variant: true
      }
    });

    await tx.inventoryTransaction.create({
      data: {
        organizationId,
        inventoryId: inv.id,
        type: "PURCHASE",
        quantity: qty,
        previousQuantity,
        newQuantity,
        previousReservedQuantity: inv.reservedQuantity,
        newReservedQuantity: inv.reservedQuantity,
        referenceId: referenceNumber || null,
        referenceType: "PURCHASE_ORDER",
        reason: supplier ? `Received from ${supplier}` : "Stock received",
        notes,
        createdById: userId
      }
    });

    await syncProductStockCache(tx, inv.productId, inv.variantId);

    return {
      ...updated,
      inventory: updated,
      previousQuantity,
      newQuantity,
      availableQuantity: updated.quantity - updated.reservedQuantity
    };
  });
}

/**
 * ─── 5. MANUAL ADJUSTMENT (Damage, Loss, Physical Count Count Audit) ─────────
 */
export async function adjustInventory({
  organizationId,
  inventoryId,
  adjustmentQuantity = null,
  newTotalQuantity = null,
  reason,
  notes = null,
  type = "ADJUSTMENT",
  userId = null
}) {
  if (!reason) {
    throw new AppError("A reason is mandatory for manual stock adjustments", HTTP_STATUS.BAD_REQUEST, "REASON_REQUIRED");
  }

  return prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.findFirst({
      where: { id: inventoryId, organizationId },
      include: { warehouse: true, product: true, variant: true }
    });

    if (!inv) {
      throw new AppError("Inventory record not found", HTTP_STATUS.NOT_FOUND, "INVENTORY_NOT_FOUND");
    }

    let nextQuantity;
    let diffQty;

    if (newTotalQuantity !== null && newTotalQuantity !== undefined) {
      nextQuantity = Number(newTotalQuantity);
      diffQty = nextQuantity - inv.quantity;
    } else if (adjustmentQuantity !== null && adjustmentQuantity !== undefined) {
      diffQty = Number(adjustmentQuantity);
      nextQuantity = inv.quantity + diffQty;
    } else {
      throw new AppError("Specify either adjustmentQuantity or newTotalQuantity", HTTP_STATUS.BAD_REQUEST, "INVALID_ADJUSTMENT_VALUE");
    }

    if (nextQuantity < inv.reservedQuantity) {
      throw new AppError(
        `Adjusted stock (${nextQuantity}) cannot be lower than current reserved reservations (${inv.reservedQuantity})`,
        HTTP_STATUS.BAD_REQUEST,
        "CANNOT_REDUCE_BELOW_RESERVED"
      );
    }

    const validTypes = ["ADJUSTMENT", "DAMAGE", "LOSS", "RESTOCK"];
    const txType = validTypes.includes(type) ? type : "ADJUSTMENT";

    const updated = await tx.inventory.update({
      where: { id: inv.id },
      data: { quantity: nextQuantity },
      include: { warehouse: true, product: true, variant: true }
    });

    await tx.inventoryTransaction.create({
      data: {
        organizationId,
        inventoryId: inv.id,
        type: txType,
        quantity: diffQty,
        previousQuantity: inv.quantity,
        newQuantity: nextQuantity,
        previousReservedQuantity: inv.reservedQuantity,
        newReservedQuantity: inv.reservedQuantity,
        reason,
        notes,
        createdById: userId
      }
    });

    await syncProductStockCache(tx, inv.productId, inv.variantId);

    return {
      ...updated,
      previousQuantity: inv.quantity,
      newQuantity: nextQuantity,
      availableQuantity: updated.quantity - updated.reservedQuantity
    };
  });
}

/**
 * ─── 6. RETURNS (Restock vs Damaged Return) ──────────────────────────────────
 */
export async function returnInventory({
  organizationId,
  orderId,
  items,
  returnToStock = true,
  condition = "SELLABLE",
  reason = "Customer return",
  userId = null
}) {
  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const item of items) {
      const qty = Number(item.quantity || 1);
      if (qty <= 0) continue;

      const pId = item.productId || null;
      const vId = item.variantId || null;

      // Find inventory in fulfillment warehouse
      const inv = await findOrCreateInventory({
        organizationId,
        warehouseId: item.warehouseId || null,
        productId: pId,
        variantId: vId,
        tx
      });

      const isSellable = returnToStock && condition === "SELLABLE";
      const previousQuantity = inv.quantity;
      const newQuantity = isSellable ? previousQuantity + qty : previousQuantity;

      if (isSellable) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: { quantity: newQuantity }
        });
        await syncProductStockCache(tx, inv.productId, inv.variantId);
      }

      await tx.inventoryTransaction.create({
        data: {
          organizationId,
          inventoryId: inv.id,
          type: isSellable ? "RETURN" : "DAMAGE",
          quantity: qty,
          previousQuantity,
          newQuantity,
          previousReservedQuantity: inv.reservedQuantity,
          newReservedQuantity: inv.reservedQuantity,
          referenceId: orderId || null,
          referenceType: "ORDER_RETURN",
          reason: `${reason} [Condition: ${condition}]`,
          createdById: userId
        }
      });

      results.push({
        inventoryId: inv.id,
        quantityReturned: qty,
        restocked: isSellable,
        condition,
        previousQuantity,
        newQuantity
      });
    }

    return { success: true, orderId, items: results, results };
  });
}

/**
 * ─── 7. WAREHOUSE TRANSFER ──────────────────────────────────────────────────
 * Atomic warehouse-to-warehouse stock movement with double-entry audit records.
 */
export async function transferInventory({
  organizationId,
  sourceWarehouseId,
  destinationWarehouseId,
  items,
  notes = null,
  userId = null
}) {
  if (sourceWarehouseId === destinationWarehouseId) {
    throw new AppError("Source and destination warehouses cannot be the same", HTTP_STATUS.BAD_REQUEST, "IDENTICAL_WAREHOUSES");
  }

  return prisma.$transaction(async (tx) => {
    const transferNumber = `TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const transfer = await tx.inventoryTransfer.create({
      data: {
        organizationId,
        transferNumber,
        sourceWarehouseId,
        destinationWarehouseId,
        status: "COMPLETED",
        notes,
        createdById: userId,
        completedAt: new Date()
      }
    });

    for (const item of items) {
      const transferQty = Number(item.quantity);
      if (transferQty <= 0) {
        throw new AppError("Transfer quantity must be positive", HTTP_STATUS.BAD_REQUEST, "INVALID_QUANTITY");
      }

      // Source inventory check
      const sourceInv = await tx.inventory.findFirst({
        where: {
          id: item.inventoryId,
          organizationId,
          warehouseId: sourceWarehouseId
        },
        include: { product: true, variant: true }
      });

      if (!sourceInv) {
        throw new AppError("Source inventory not found", HTTP_STATUS.NOT_FOUND, "SOURCE_INVENTORY_NOT_FOUND");
      }

      const availableInSource = sourceInv.quantity - sourceInv.reservedQuantity;
      if (availableInSource < transferQty) {
        const label = sourceInv.variant?.name || sourceInv.product?.name || "Item";
        throw new AppError(
          `Insufficient available stock in source warehouse for ${label}. Available: ${availableInSource}, Requested: ${transferQty}`,
          HTTP_STATUS.BAD_REQUEST,
          "INSUFFICIENT_TRANSFER_STOCK"
        );
      }

      // Destination inventory find or create
      const destInv = await findOrCreateInventory({
        organizationId,
        warehouseId: destinationWarehouseId,
        productId: sourceInv.productId,
        variantId: sourceInv.variantId,
        tx
      });

      // 1. Deduct from Source (TRANSFER_OUT)
      const srcPrev = sourceInv.quantity;
      const srcNext = srcPrev - transferQty;
      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { quantity: srcNext }
      });

      await tx.inventoryTransaction.create({
        data: {
          organizationId,
          inventoryId: sourceInv.id,
          type: "TRANSFER_OUT",
          quantity: transferQty,
          previousQuantity: srcPrev,
          newQuantity: srcNext,
          previousReservedQuantity: sourceInv.reservedQuantity,
          newReservedQuantity: sourceInv.reservedQuantity,
          referenceId: transfer.id,
          referenceType: "TRANSFER",
          reason: `Transfer to warehouse ${destinationWarehouseId}`,
          createdById: userId
        }
      });

      // 2. Add to Destination (TRANSFER_IN)
      const dstPrev = destInv.quantity;
      const dstNext = dstPrev + transferQty;
      await tx.inventory.update({
        where: { id: destInv.id },
        data: { quantity: dstNext }
      });

      await tx.inventoryTransaction.create({
        data: {
          organizationId,
          inventoryId: destInv.id,
          type: "TRANSFER_IN",
          quantity: transferQty,
          previousQuantity: dstPrev,
          newQuantity: dstNext,
          previousReservedQuantity: destInv.reservedQuantity,
          newReservedQuantity: destInv.reservedQuantity,
          referenceId: transfer.id,
          referenceType: "TRANSFER",
          reason: `Transfer from warehouse ${sourceWarehouseId}`,
          createdById: userId
        }
      });

      // Record transfer item
      await tx.inventoryTransferItem.create({
        data: {
          transferId: transfer.id,
          inventoryId: sourceInv.id,
          quantity: transferQty
        }
      });

      await syncProductStockCache(tx, sourceInv.productId, sourceInv.variantId);
    }

    return {
      success: true,
      itemsTransferred: items.length,
      ...transfer
    };
  });
}

/**
 * Automatically ensures that existing catalog products and variants have an inventory record
 * in the tenant's default warehouse if the tenant's inventory table is uninitialized.
 */
export async function ensureCatalogInventory(organizationId, tx = prisma) {
  try {
    const defaultWarehouse = await getOrCreateDefaultWarehouse(organizationId, tx);
    const products = await tx.product.findMany({
      where: { isActive: true },
      include: { variants: { where: { isActive: true } } }
    });

    for (const prod of products) {
      if (prod.type === "VARIABLE" && prod.variants?.length > 0) {
        for (const variant of prod.variants) {
          const exists = await tx.inventory.findFirst({
            where: { warehouseId: defaultWarehouse.id, variantId: variant.id }
          });
          if (!exists) {
            await tx.inventory.create({
              data: {
                organizationId,
                warehouseId: defaultWarehouse.id,
                variantId: variant.id,
                productId: null,
                quantity: variant.stock || 50,
                reservedQuantity: 0,
                reorderLevel: 10,
                reorderQuantity: 20
              }
            });
          }
        }
      } else {
        const exists = await tx.inventory.findFirst({
          where: { warehouseId: defaultWarehouse.id, productId: prod.id, variantId: null }
        });
        if (!exists) {
          await tx.inventory.create({
            data: {
              organizationId,
              warehouseId: defaultWarehouse.id,
              productId: prod.id,
              variantId: null,
              quantity: prod.stock || 100,
              reservedQuantity: 0,
              reorderLevel: 10,
              reorderQuantity: 20
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not auto-seed catalog inventory:", err.message);
  }
}

/**
 * ─── 8. QUERY & REPORTING FUNCTIONS ─────────────────────────────────────────
 */
export async function listInventory(organizationId, {
  warehouseId,
  productId,
  variantId,
  lowStock,
  outOfStock,
  search,
  page = 1,
  limit = 50
} = {}) {
  // Check if inventory is empty for this organization, and auto-initialize from product catalog if so
  const currentCount = await prisma.inventory.count({ where: { organizationId } });
  if (currentCount === 0) {
    await ensureCatalogInventory(organizationId);
  }

  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const where = {
    organizationId,
    ...(warehouseId ? { warehouseId } : {}),
    ...(productId ? { productId } : {}),
    ...(variantId ? { variantId } : {}),
    ...(outOfStock ? { quantity: { lte: 0 } } : {})
  };

  if (search) {
    where.OR = [
      { product: { name: { contains: search, mode: "insensitive" } } },
      { product: { sku: { contains: search, mode: "insensitive" } } },
      { variant: { name: { contains: search, mode: "insensitive" } } },
      { variant: { sku: { contains: search, mode: "insensitive" } } },
      { warehouse: { name: { contains: search, mode: "insensitive" } } }
    ];
  }

  const [rawItems, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      where,
      skip,
      take,
      include: {
        warehouse: { select: { id: true, name: true, code: true, city: true, country: true } },
        product: { select: { id: true, name: true, sku: true, basePrice: true, type: true, category: { select: { name: true } } } },
        variant: { select: { id: true, name: true, sku: true, attributes: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    }),
    prisma.inventory.count({ where })
  ]);

  const items = rawItems.map((inv) => {
    const availableQuantity = Math.max(0, inv.quantity - inv.reservedQuantity);
    let status = "IN_STOCK";
    if (availableQuantity <= 0) {
      status = "OUT_OF_STOCK";
    } else if (availableQuantity <= inv.reorderLevel) {
      status = "LOW_STOCK";
    }

    return {
      ...inv,
      availableQuantity,
      status
    };
  });

  const finalItems = lowStock
    ? items.filter((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK")
    : items;

  return {
    items: finalItems,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / take)
  };
}

export async function getInventoryById(organizationId, id) {
  const inv = await prisma.inventory.findFirst({
    where: { id, organizationId },
    include: {
      warehouse: true,
      product: { include: { category: true, brand: true, images: true } },
      variant: true,
      transactions: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } }
      }
    }
  });

  if (!inv) {
    throw new AppError("Inventory record not found", HTTP_STATUS.NOT_FOUND, "INVENTORY_NOT_FOUND");
  }

  const availableQuantity = Math.max(0, inv.quantity - inv.reservedQuantity);
  const status = availableQuantity <= 0 ? "OUT_OF_STOCK" : availableQuantity <= inv.reorderLevel ? "LOW_STOCK" : "IN_STOCK";

  return { ...inv, availableQuantity, status };
}

export async function getLowStockItems(organizationId) {
  return listInventory(organizationId, { lowStock: true, limit: 100 });
}

export async function getOutOfStockItems(organizationId) {
  return listInventory(organizationId, { outOfStock: true, limit: 100 });
}

export async function getInventorySummary(organizationId) {
  const [totalInventories, stockAgg, warehouseCount, lowStockRaw] = await prisma.$transaction([
    prisma.inventory.count({ where: { organizationId } }),
    prisma.inventory.aggregate({
      where: { organizationId },
      _sum: { quantity: true, reservedQuantity: true }
    }),
    prisma.warehouse.count({ where: { organizationId, isActive: true } }),
    prisma.inventory.findMany({
      where: { organizationId },
      select: { quantity: true, reservedQuantity: true, reorderLevel: true }
    })
  ]);

  const totalQuantity = stockAgg._sum.quantity || 0;
  const totalReserved = stockAgg._sum.reservedQuantity || 0;
  const totalAvailable = Math.max(0, totalQuantity - totalReserved);

  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const item of lowStockRaw) {
    const avail = item.quantity - item.reservedQuantity;
    if (avail <= 0) {
      outOfStockCount++;
    } else if (avail <= item.reorderLevel) {
      lowStockCount++;
    }
  }

  return {
    totalProducts: totalInventories,
    totalItems: totalInventories,
    totalStockUnits: totalQuantity,
    totalQuantity,
    totalReservedUnits: totalReserved,
    totalReserved,
    totalAvailableUnits: totalAvailable,
    totalAvailable,
    lowStockCount,
    outOfStockCount,
    warehouseCount,
    activeWarehouses: warehouseCount
  };
}

export async function getInventoryValuation(organizationId) {
  const inventories = await prisma.inventory.findMany({
    where: { organizationId, quantity: { gt: 0 } },
    include: {
      product: { select: { basePrice: true } },
      variant: true,
      warehouse: { select: { id: true, name: true } }
    }
  });

  let totalValuation = 0;
  const warehouseBreakdown = {};

  for (const inv of inventories) {
    const unitPrice = Number(inv.variant?.price || inv.product?.basePrice || 0);
    const itemValue = unitPrice * inv.quantity;
    totalValuation += itemValue;

    const wName = inv.warehouse?.name || "Main Warehouse";
    if (!warehouseBreakdown[wName]) {
      warehouseBreakdown[wName] = { quantity: 0, valuation: 0 };
    }
    warehouseBreakdown[wName].quantity += inv.quantity;
    warehouseBreakdown[wName].valuation += itemValue;
  }

  return {
    totalValuation: Math.round(totalValuation * 100) / 100,
    warehouseBreakdown
  };
}
