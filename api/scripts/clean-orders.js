import { prisma } from "../src/config/prisma.js";

/**
 * ─── CLEAN ALL B2B AND B2C ORDERS SCRIPT ──────────────────────────────────
 * Safely removes all retail and wholesale orders from the database inside
 * an atomic Prisma transaction and resets orphaned inventory reservations.
 *
 * Usage:
 *   npm run db:clean-orders
 *   or: node scripts/clean-orders.js
 */

export async function cleanAllOrders() {
  console.log("=================================================");
  console.log("🧹 STARTING DATABASE CLEANUP: B2B & B2C ORDERS");
  console.log("=================================================\n");

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete Invoices associated with orders or bulkOrders
      const deletedInvoices = await tx.invoice.deleteMany({});

      // 2. Delete ShipmentItems and Shipments
      const deletedShipmentItems = await tx.shipmentItem.deleteMany({});
      const deletedShipments = await tx.shipment.deleteMany({});

      // 3. Delete ShippingRateSnapshots
      const deletedShippingRateSnapshots = await tx.shippingRateSnapshot.deleteMany({});

      // 4. Delete B2C Order child records
      const deletedOrderItems = await tx.orderItem.deleteMany({});
      const deletedOrderAddresses = await tx.orderAddress.deleteMany({});

      // 5. Delete B2C Orders
      const deletedOrders = await tx.order.deleteMany({});

      // 6. Delete B2B BulkOrder child records and BulkOrders
      const deletedBulkOrderItems = await tx.bulkOrderItem.deleteMany({});
      const deletedBulkOrders = await tx.bulkOrder.deleteMany({});

      // 7. Reset inventory reservedQuantity to 0
      const resetInventory = await tx.inventory.updateMany({
        where: {
          reservedQuantity: { gt: 0 }
        },
        data: {
          reservedQuantity: 0
        }
      });

      return {
        deletedOrders: deletedOrders.count,
        deletedOrderItems: deletedOrderItems.count,
        deletedOrderAddresses: deletedOrderAddresses.count,
        deletedBulkOrders: deletedBulkOrders.count,
        deletedBulkOrderItems: deletedBulkOrderItems.count,
        deletedInvoices: deletedInvoices.count,
        deletedShipments: deletedShipments.count,
        deletedShipmentItems: deletedShipmentItems.count,
        deletedShippingRateSnapshots: deletedShippingRateSnapshots.count,
        inventoryRecordsReset: resetInventory.count
      };
    }, {
      timeout: 60000
    });

    console.log("✅ Cleanup finished successfully! Summary of removed data:");
    console.table([
      { Entity: "B2C Orders (Order)", Count: result.deletedOrders },
      { Entity: "B2C Order Items (OrderItem)", Count: result.deletedOrderItems },
      { Entity: "B2C Order Addresses (OrderAddress)", Count: result.deletedOrderAddresses },
      { Entity: "B2B Bulk Orders (BulkOrder)", Count: result.deletedBulkOrders },
      { Entity: "B2B Bulk Order Items (BulkOrderItem)", Count: result.deletedBulkOrderItems },
      { Entity: "Invoices (Invoice)", Count: result.deletedInvoices },
      { Entity: "Shipments (Shipment)", Count: result.deletedShipments },
      { Entity: "Shipment Items (ShipmentItem)", Count: result.deletedShipmentItems },
      { Entity: "Shipping Rate Snapshots", Count: result.deletedShippingRateSnapshots },
      { Entity: "Inventory Reservations Reset", Count: result.inventoryRecordsReset }
    ]);

    await prisma.$disconnect();
    return result;
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    await prisma.$disconnect();
    throw err;
  }
}

// Execute when invoked directly from CLI
cleanAllOrders().catch(() => process.exit(1));
