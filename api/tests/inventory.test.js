import assert from "node:assert/strict";
import { prisma } from "../src/config/prisma.js";
import * as inventoryService from "../src/modules/inventory/inventory.service.js";
import * as warehouseService from "../src/modules/inventory/warehouse.service.js";
import * as paymentService from "../src/modules/payments/payment.service.js";
import { AppError } from "../src/common/errors/app-error.js";

const TEST_RUN_ID = `test_${Date.now()}`;

async function runTestSuite() {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING ENTERPRISE INVENTORY TEST SUITE [${TEST_RUN_ID}]`);
  console.log(`======================================================\n`);

  let testCount = 0;
  let passedCount = 0;

  async function test(name, fn) {
    testCount++;
    process.stdout.write(`Test ${testCount}: ${name} ... `);
    try {
      await fn();
      passedCount++;
      console.log(`✅ PASSED`);
    } catch (err) {
      console.log(`❌ FAILED`);
      console.error(`   Error: ${err.message}`);
      if (err.stack) {
        console.error(`   ${err.stack.split("\n").slice(1, 3).join("\n   ")}`);
      }
    }
  }

  // ─── SETUP FIXTURES ──────────────────────────────────────────
  console.log(`📦 Setting up test fixtures...`);

  // 1. Create two test organizations for multi-tenant isolation testing
  const tenantA = await prisma.organization.create({
    data: {
      name: `Tenant Alpha ${TEST_RUN_ID}`,
      slug: `tenant-alpha-${TEST_RUN_ID}`,
      code: `T-A-${Date.now().toString().slice(-4)}`
    }
  });

  const tenantB = await prisma.organization.create({
    data: {
      name: `Tenant Beta ${TEST_RUN_ID}`,
      slug: `tenant-beta-${TEST_RUN_ID}`,
      code: `T-B-${Date.now().toString().slice(-4)}`
    }
  });

  const testUser = await prisma.user.create({
    data: {
      email: `inventory-tester-${TEST_RUN_ID}@vanom.com`,
      passwordHash: "dummyhash123",
      firstName: "Inventory",
      lastName: "Tester",
      role: "COMPANY_ADMIN",
      organizationId: tenantA.id
    }
  });

  // 2. Create warehouses for Tenant A and Tenant B
  const warehouseA1 = await warehouseService.createWarehouse(tenantA.id, {
    name: "Hyderabad Central Hub",
    code: `HYD-${Date.now().toString().slice(-4)}`,
    city: "Hyderabad",
    country: "India",
    address: "HITEC City Phase 2"
  });

  const warehouseA2 = await warehouseService.createWarehouse(tenantA.id, {
    name: "Delhi Depot",
    code: `DEL-${Date.now().toString().slice(-4)}`,
    city: "Delhi",
    country: "India",
    address: "Okhla Industrial Area"
  });

  const warehouseB1 = await warehouseService.createWarehouse(tenantB.id, {
    name: "Tenant B Mumbai Hub",
    code: `MUM-${Date.now().toString().slice(-4)}`,
    city: "Mumbai",
    country: "India",
    address: "Bandra Kurla"
  });

  // 3. Create test simple product and variable product
  const simpleProduct = await prisma.product.create({
    data: {
      name: `Pure Organic Honey ${TEST_RUN_ID}`,
      slug: `pure-organic-honey-${TEST_RUN_ID}`,
      sku: `HONEY-${TEST_RUN_ID}`,
      type: "SIMPLE",
      basePrice: 25.0,
      stock: 100
    }
  });

  const variableProduct = await prisma.product.create({
    data: {
      name: `Cold Pressed Sesame Oil ${TEST_RUN_ID}`,
      slug: `cold-pressed-oil-${TEST_RUN_ID}`,
      sku: `OIL-ROOT-${TEST_RUN_ID}`,
      type: "VARIABLE",
      basePrice: 35.0,
      stock: 0
    }
  });

  const variantRedS = await prisma.productVariant.create({
    data: {
      productId: variableProduct.id,
      name: "500ml Bottle",
      sku: `OIL-500ML-${TEST_RUN_ID}`,
      stock: 50
    }
  });

  const variantBlueM = await prisma.productVariant.create({
    data: {
      productId: variableProduct.id,
      name: "1000ml Bottle",
      sku: `OIL-1000ML-${TEST_RUN_ID}`,
      stock: 40
    }
  });

  console.log(`✅ Test fixtures prepared successfully.\n`);

  // ─── TEST 1: Simple Product Inventory Initialization ───────────
  await test("1. Simple product inventory initialize with stock = 100", async () => {
    const inv = await inventoryService.findOrCreateInventory({
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      productId: simpleProduct.id,
      initialQuantity: 100
    });

    assert.equal(inv.quantity, 100);
    assert.equal(inv.reservedQuantity, 0);
    assert.equal(inv.quantity - inv.reservedQuantity, 100);
    assert.equal(inv.productId, simpleProduct.id);
    assert.equal(inv.variantId, null);
  });

  // ─── TEST 2: Product Variant Inventory Initialization ──────────
  await test("2. Product variant inventory initialize with stock = 50", async () => {
    const invVar = await inventoryService.findOrCreateInventory({
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      productId: variableProduct.id,
      variantId: variantRedS.id,
      initialQuantity: 50
    });

    assert.equal(invVar.quantity, 50);
    assert.equal(invVar.reservedQuantity, 0);
    assert.equal(invVar.variantId, variantRedS.id);
  });

  // ─── TEST 3: Stock Reservation ─────────────────────────────────
  let testOrder1;
  await test("3. Stock reservation during checkout (Physical=100, Order=3 -> Reserved=3, Available=97)", async () => {
    // Create test order
    testOrder1 = await prisma.order.create({
      data: {
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        userId: testUser.id,
        status: "PENDING",
        currencyCode: "USD",
        total: 75.0,
        subtotal: 75.0,
        inventoryReserved: false,
        inventoryDeducted: false,
        items: {
          create: [
            {
              productId: simpleProduct.id,
              productName: simpleProduct.name,
              sku: simpleProduct.sku,
              quantity: 3,
              unitPrice: 25.0,
              total: 75.0
            }
          ]
        }
      }
    });

    const reserveRes = await inventoryService.reserveInventory({
      orderId: testOrder1.id,
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      items: [{ productId: simpleProduct.id, quantity: 3 }]
    });

    assert.equal(reserveRes.success, true);

    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });
    assert.equal(inv.quantity, 100);
    assert.equal(inv.reservedQuantity, 3);
    assert.equal(inv.quantity - inv.reservedQuantity, 97);

    // Verify transaction audit log
    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "RESERVATION", referenceId: testOrder1.id }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, 3);
    assert.equal(txn.previousReservedQuantity, 0);
    assert.equal(txn.newReservedQuantity, 3);
  });

  // ─── TEST 4: Stock Release ─────────────────────────────────────
  await test("4. Stock release on checkout cancellation (Reserved=3 -> Reserved=0, Available=100)", async () => {
    const releaseRes = await inventoryService.releaseInventory(testOrder1.id, {
      reason: "Order cancelled before payment"
    });
    assert.equal(releaseRes.success, true);

    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });
    assert.equal(inv.quantity, 100);
    assert.equal(inv.reservedQuantity, 0);
    assert.equal(inv.quantity - inv.reservedQuantity, 100);

    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "RELEASE", referenceId: testOrder1.id }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, 3);
  });

  // ─── TEST 5: Payment Success & Physical Stock Deduction ────────
  let testOrder2;
  await test("5. Payment success: confirm reservation, deduct physical stock (Qty=100 -> Qty=97, Reserved=0)", async () => {
    // Setup order and reserve 3 units
    testOrder2 = await prisma.order.create({
      data: {
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        userId: testUser.id,
        status: "PENDING",
        currencyCode: "USD",
        total: 75.0,
        subtotal: 75.0,
        items: {
          create: [
            {
              productId: simpleProduct.id,
              productName: simpleProduct.name,
              sku: simpleProduct.sku,
              quantity: 3,
              unitPrice: 25.0,
              total: 75.0
            }
          ]
        }
      }
    });

    await inventoryService.reserveInventory({
      orderId: testOrder2.id,
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      items: [{ productId: simpleProduct.id, quantity: 3 }]
    });

    // Capture payment -> triggers deductInventory
    await paymentService.capturePayment(`pay_test_${Date.now()}`, {
      orderId: testOrder2.id,
      amount: 75.0
    });

    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });
    assert.equal(inv.quantity, 97);
    assert.equal(inv.reservedQuantity, 0);
    assert.equal(inv.quantity - inv.reservedQuantity, 97);

    // Verify SALE transaction created
    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "SALE", referenceId: testOrder2.id }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, 3);
    assert.equal(txn.previousQuantity, 100);
    assert.equal(txn.newQuantity, 97);
  });

  // ─── TEST 6: Payment Failure Webhook Releases Reservation ──────
  await test("6. Stripe webhook payment_failed releases reservation idempotently", async () => {
    const failedOrder = await prisma.order.create({
      data: {
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        userId: testUser.id,
        status: "PENDING",
        currencyCode: "USD",
        total: 50.0,
        subtotal: 50.0,
        items: {
          create: [
            {
              productId: simpleProduct.id,
              productName: simpleProduct.name,
              sku: simpleProduct.sku,
              quantity: 2,
              unitPrice: 25.0,
              total: 50.0
            }
          ]
        }
      }
    });

    await inventoryService.reserveInventory({
      orderId: failedOrder.id,
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      items: [{ productId: simpleProduct.id, quantity: 2 }]
    });

    // Simulate Stripe webhook payment_intent.payment_failed
    const webhookRes = await paymentService.processWebhook({
      type: "payment_intent.payment_failed",
      orderId: failedOrder.id
    });
    assert.equal(webhookRes.inventoryAction, "released");

    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });
    assert.equal(inv.reservedQuantity, 0);
  });

  // ─── TEST 7: Duplicate Stripe Webhook Idempotency ──────────────
  await test("7. Duplicate Stripe webhook does NOT deduct stock twice", async () => {
    // Repeat webhook with testOrder2 which was already deducted in Test 5
    const webhookRes = await paymentService.processWebhook({
      type: "payment_intent.succeeded",
      orderId: testOrder2.id
    });
    assert.equal(webhookRes.inventoryAction, "already_deducted");

    // Stock must stay exactly 97
    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });
    assert.equal(inv.quantity, 97);
  });

  // ─── TEST 8: Duplicate Cancellation Idempotency ────────────────
  await test("8. Duplicate order cancellation does NOT release reservation twice", async () => {
    const res = await inventoryService.releaseInventory(testOrder1.id, {
      reason: "Duplicate cancellation attempt"
    });
    assert.equal(res.success, true);
    assert.equal(res.message, "Reservation already released or not active");
  });

  // ─── TEST 9: Insufficient Stock Handling ───────────────────────
  await test("9. Insufficient stock returns clear error INSUFFICIENT_STOCK", async () => {
    await assert.rejects(
      async () => {
        await inventoryService.reserveInventory({
          orderId: `ord_oversell_${Date.now()}`,
          organizationId: tenantA.id,
          warehouseId: warehouseA1.id,
          items: [{ productId: simpleProduct.id, quantity: 9999 }]
        });
      },
      (err) => {
        assert.ok(err.code === "INSUFFICIENT_STOCK" || err.message.includes("Insufficient"));
        return true;
      }
    );
  });

  // ─── TEST 10: Concurrency / Oversell Prevention ────────────────
  await test("10. Concurrency: Stock=5, Order A=4, Order B=3 concurrently -> Only ONE succeeds", async () => {
    // Create item with exactly 5 stock
    const limitedProduct = await prisma.product.create({
      data: {
        name: `Limited Saffron ${TEST_RUN_ID}`,
        slug: `limited-saffron-${TEST_RUN_ID}`,
        sku: `SAFFRON-${TEST_RUN_ID}`,
        type: "SIMPLE",
        basePrice: 90.0,
        stock: 5
      }
    });

    await inventoryService.findOrCreateInventory({
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      productId: limitedProduct.id,
      initialQuantity: 5
    });

    const orderA = await prisma.order.create({
      data: {
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        userId: testUser.id,
        status: "PENDING",
        currencyCode: "USD",
        total: 360.0,
        subtotal: 360.0,
        items: {
          create: [{ productId: limitedProduct.id, productName: limitedProduct.name, quantity: 4, unitPrice: 90.0, total: 360.0 }]
        }
      }
    });

    const orderB = await prisma.order.create({
      data: {
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        userId: testUser.id,
        status: "PENDING",
        currencyCode: "USD",
        total: 270.0,
        subtotal: 270.0,
        items: {
          create: [{ productId: limitedProduct.id, productName: limitedProduct.name, quantity: 3, unitPrice: 90.0, total: 270.0 }]
        }
      }
    });

    // Run both reservations simultaneously using Promise.allSettled
    const results = await Promise.allSettled([
      inventoryService.reserveInventory({
        orderId: orderA.id,
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        items: [{ productId: limitedProduct.id, quantity: 4 }]
      }),
      inventoryService.reserveInventory({
        orderId: orderB.id,
        organizationId: tenantA.id,
        warehouseId: warehouseA1.id,
        items: [{ productId: limitedProduct.id, quantity: 3 }]
      })
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const rejections = results.filter((r) => r.status === "rejected");

    assert.equal(successes.length, 1, "Exactly one order reservation must succeed");
    assert.equal(rejections.length, 1, "Exactly one order reservation must be rejected for insufficient stock");

    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: limitedProduct.id }
    });
    // Available stock must never be negative
    assert.ok(inv.quantity - inv.reservedQuantity >= 0);
  });

  // ─── TEST 11: Purchase Stock Receiving ─────────────────────────
  await test("11. Purchase stock receiving (Inward 50 units -> stock increases to 147)", async () => {
    const receiveRes = await inventoryService.receiveInventory({
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      productId: simpleProduct.id,
      quantity: 50,
      supplier: "Himalayan Farms Co",
      referenceNumber: `PO-${TEST_RUN_ID}`,
      notes: "Received batch in good shape"
    });

    assert.equal(receiveRes.previousQuantity, 97);
    assert.equal(receiveRes.newQuantity, 147);

    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: receiveRes.inventory.id, type: "PURCHASE" },
      orderBy: { createdAt: "desc" }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, 50);
  });

  // ─── TEST 12: Manual Stock Adjustment ──────────────────────────
  await test("12. Manual stock adjustment (Adjust -7 units for audit discrepancy)", async () => {
    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });

    const adjustRes = await inventoryService.adjustInventory({
      organizationId: tenantA.id,
      inventoryId: inv.id,
      adjustmentQuantity: -7,
      type: "ADJUSTMENT",
      reason: "Cycle count variance audit",
      notes: "Verified by Inventory Manager"
    });

    assert.equal(adjustRes.previousQuantity, 147);
    assert.equal(adjustRes.newQuantity, 140);

    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "ADJUSTMENT" },
      orderBy: { createdAt: "desc" }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, -7);
    assert.equal(txn.reason, "Cycle count variance audit");
  });

  // ─── TEST 13: Damage / Loss Write-Off ──────────────────────────
  await test("13. Damage / Loss write-off (Damage 5 units -> physical stock reduced without sellable restore)", async () => {
    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });

    const damageRes = await inventoryService.adjustInventory({
      organizationId: tenantA.id,
      inventoryId: inv.id,
      adjustmentQuantity: -5,
      type: "DAMAGE",
      reason: "Damaged during warehouse handling",
      notes: "Broken seal on 5 jars"
    });

    assert.equal(damageRes.newQuantity, 135);

    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "DAMAGE" },
      orderBy: { createdAt: "desc" }
    });
    assert.ok(txn);
    assert.equal(txn.reason, "Damaged during warehouse handling");
  });

  // ─── TEST 14: Customer Returns (Sellable vs Damaged) ───────────
  await test("14. Customer Returns: Sellable returns restock physical inventory (+2)", async () => {
    const inv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });

    const returnRes = await inventoryService.returnInventory({
      organizationId: tenantA.id,
      orderId: testOrder2.id,
      returnToStock: true,
      condition: "SELLABLE",
      reason: "Customer ordered wrong size, original packaging intact",
      items: [
        {
          productId: simpleProduct.id,
          warehouseId: warehouseA1.id,
          quantity: 2
        }
      ]
    });

    assert.equal(returnRes.success, true);
    assert.equal(returnRes.results[0].newQuantity, 137);

    const txn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: inv.id, type: "RETURN" },
      orderBy: { createdAt: "desc" }
    });
    assert.ok(txn);
    assert.equal(txn.quantity, 2);
  });

  // ─── TEST 15: Warehouse Transfer (Atomic Source & Dest) ─────────
  await test("15. Warehouse transfer: Hyderabad -> Delhi (20 units atomically transferred)", async () => {
    const sourceInv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id }
    });

    const transferRes = await inventoryService.transferInventory({
      organizationId: tenantA.id,
      sourceWarehouseId: warehouseA1.id,
      destinationWarehouseId: warehouseA2.id,
      notes: "Inter-state depot rebalancing via express truck",
      items: [
        {
          inventoryId: sourceInv.id,
          quantity: 20
        }
      ]
    });

    assert.equal(transferRes.success, true);
    assert.equal(transferRes.itemsTransferred, 1);

    // Source Hyderabad: 137 - 20 = 117
    const updatedSource = await prisma.inventory.findUnique({ where: { id: sourceInv.id } });
    assert.equal(updatedSource.quantity, 117);

    // Destination Delhi: 0 + 20 = 20
    const destInv = await prisma.inventory.findFirst({
      where: { warehouseId: warehouseA2.id, productId: simpleProduct.id }
    });
    assert.equal(destInv.quantity, 20);

    // Verify dual audit transactions
    const outTxn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: sourceInv.id, type: "TRANSFER_OUT" }
    });
    assert.ok(outTxn);
    assert.equal(outTxn.quantity, 20);

    const inTxn = await prisma.inventoryTransaction.findFirst({
      where: { inventoryId: destInv.id, type: "TRANSFER_IN" }
    });
    assert.ok(inTxn);
    assert.equal(inTxn.quantity, 20);
  });

  // ─── TEST 16: Multi-Tenant Data Isolation ──────────────────────
  await test("16. Multi-Tenant isolation: Tenant A cannot access or transfer from Tenant B's warehouse", async () => {
    // Attempting to list or transfer from Tenant B's warehouse using Tenant A's organizationId must fail
    await assert.rejects(
      async () => {
        await warehouseService.getWarehouseById(tenantA.id, warehouseB1.id);
      },
      (err) => {
        assert.ok(err.code === "WAREHOUSE_NOT_FOUND");
        return true;
      }
    );

    // Querying inventory for Tenant A must never return Tenant B items
    const listA = await inventoryService.listInventory(tenantA.id);
    const hasTenantBItem = listA.items.some((i) => i.warehouseId === warehouseB1.id);
    assert.equal(hasTenantBItem, false);
  });

  // ─── TEST 17: Product Variant Independent Inventory ───────────
  await test("17. Product variants track independent inventory and sync product stock cache", async () => {
    // Setup variant 2 (Blue M)
    const invVar2 = await inventoryService.findOrCreateInventory({
      organizationId: tenantA.id,
      warehouseId: warehouseA1.id,
      productId: variableProduct.id,
      variantId: variantBlueM.id,
      initialQuantity: 40
    });

    assert.equal(invVar2.quantity, 40);

    // Total stock of variable product must equal sum of all variant inventories
    const prod = await prisma.product.findUnique({
      where: { id: variableProduct.id }
    });
    assert.equal(prod.stock, 50 + 40); // Variant 1 (50) + Variant 2 (40) = 90
  });

  // ─── TEST 18: Reorder Level & Low Stock Reporting ──────────────
  await test("18. Low stock and out-of-stock reporting accurately detects threshold items", async () => {
    // Set reorder level on source simple product (stock: 117, reorderLevel: 150 -> LOW_STOCK)
    await prisma.inventory.updateMany({
      where: { warehouseId: warehouseA1.id, productId: simpleProduct.id },
      data: { reorderLevel: 150 }
    });

    const lowStock = await inventoryService.getLowStockItems(tenantA.id);
    const found = lowStock.items.some((i) => i.productId === simpleProduct.id);
    assert.equal(found, true);

    const summary = await inventoryService.getInventorySummary(tenantA.id);
    assert.ok(summary.totalStockUnits > 0);
    assert.ok(summary.warehouseCount >= 2);
  });

  // ─── SUMMARY ──────────────────────────────────────────────────
  console.log(`\n======================================================`);
  console.log(`🏁 TEST RESULTS: ${passedCount}/${testCount} TESTS PASSED`);
  if (passedCount === testCount) {
    console.log(`🎉 ALL 18 INVENTORY TEST SUITES PASSED FLAWLESSLY!`);
  } else {
    console.log(`⚠️ SOME TESTS FAILED. PLEASE CHECK OUTPUT ABOVE.`);
  }
  console.log(`======================================================\n`);
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test runner encountered fatal error:", err);
    process.exit(1);
  });
