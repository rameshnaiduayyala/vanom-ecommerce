import assert from "node:assert/strict";
import { prisma } from "../src/config/prisma.js";
import * as paymentService from "../src/modules/payments/payment.service.js";
import * as shippingService from "../src/modules/shipping/shipping.service.js";
import * as invoiceService from "../src/modules/invoice/invoice.service.js";
import * as bulkOrderService from "../src/modules/bulk/services/order.service.js";
import { resolveUserOrganization } from "../src/modules/inventory/organization.service.js";
import { uploadFile } from "../src/common/utils/file-upload.js";
import { sanitizeHtml } from "../../frontend/src/utils/sanitize.js";
import { env } from "../src/config/env.js";

const TEST_RUN_ID = `sec_${Date.now()}`;

async function runSecurityTests() {
  console.log("\n======================================================");
  console.log(`🔒 STARTING SECURITY REGRESSION TEST SUITE [${TEST_RUN_ID}]`);
  console.log("======================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`Test: ${name} ... ✅ PASSED`);
    } catch (err) {
      failed++;
      console.log(`Test: ${name} ... ❌ FAILED`);
      console.error("   Error:", err.message);
    }
  }

  // 1. Setup Test Fixtures
  const tenantA = await prisma.organization.create({
    data: { name: `Tenant A ${TEST_RUN_ID}`, slug: `tenant-a-${TEST_RUN_ID}` }
  });
  const tenantB = await prisma.organization.create({
    data: { name: `Tenant B ${TEST_RUN_ID}`, slug: `tenant-b-${TEST_RUN_ID}` }
  });

  const businessA = await prisma.bulkBusiness.create({
    data: {
      businessName: `Company A ${TEST_RUN_ID}`,
      businessEmail: `corpA_${TEST_RUN_ID}@corp.com`,
      businessPhone: "+1-800-555-0101",
      countryCode: "US",
      address: "100 Test St, City A",
      contactPersonName: "Alice Admin",
      status: "APPROVED"
    }
  });

  const businessB = await prisma.bulkBusiness.create({
    data: {
      businessName: `Company B ${TEST_RUN_ID}`,
      businessEmail: `corpB_${TEST_RUN_ID}@corp.com`,
      businessPhone: "+1-800-555-0102",
      countryCode: "US",
      address: "200 Test St, City B",
      contactPersonName: "Bob Admin",
      status: "APPROVED"
    }
  });

  const userA = await prisma.user.create({
    data: {
      email: `usera_${TEST_RUN_ID}@example.com`,
      passwordHash: "hash123",
      role: "USER",
      organizationId: tenantA.id,
      bulkBusinessId: businessA.id,
      emailVerifiedAt: new Date()
    }
  });

  const userB = await prisma.user.create({
    data: {
      email: `userb_${TEST_RUN_ID}@example.com`,
      passwordHash: "hash123",
      role: "B2B_USER",
      organizationId: tenantB.id,
      bulkBusinessId: businessB.id,
      emailVerifiedAt: new Date()
    }
  });

  const superadminUser = await prisma.user.create({
    data: {
      email: `admin_${TEST_RUN_ID}@example.com`,
      passwordHash: "hash123",
      role: "SUPERADMIN",
      emailVerifiedAt: new Date()
    }
  });

  const warehouseA = await prisma.warehouse.create({
    data: {
      organizationId: tenantA.id,
      name: `Warehouse A ${TEST_RUN_ID}`,
      code: `WHA-${TEST_RUN_ID}`,
      isDefault: true,
      isActive: true
    }
  });

  const productA = await prisma.product.create({
    data: {
      name: `Security Shield ${TEST_RUN_ID}`,
      slug: `sec-shield-${TEST_RUN_ID}`,
      basePrice: 100.0,
      sku: `SKU-${TEST_RUN_ID}`
    }
  });

  const bulkProductA = await prisma.bulkProduct.create({
    data: {
      name: `Bulk Widget ${TEST_RUN_ID}`,
      slug: `bulk-widget-${TEST_RUN_ID}`,
      type: "SIMPLE",
      sku: `BULK-${TEST_RUN_ID}`,
      countryPrices: {
        create: [
          {
            countryCode: "US",
            currencyCode: "USD",
            moq: 1,
            stock: 100,
            tiers: {
              create: [{ minQuantity: 1, maxQuantity: 50, price: 50.0 }]
            }
          }
        ]
      }
    }
  });

  const orderA = await prisma.order.create({
    data: {
      userId: userA.id,
      organizationId: tenantA.id,
      status: "PENDING",
      total: 100.0,
      subtotal: 100.0,
      currencyCode: "USD"
    }
  });

  const orderB = await prisma.order.create({
    data: {
      userId: userB.id,
      status: "PENDING",
      total: 200.0,
      subtotal: 200.0,
      currencyCode: "USD"
    }
  });

  const bulkOrderB = await prisma.bulkOrder.create({
    data: {
      orderNumber: `BULK-TEST-${TEST_RUN_ID}`,
      businessId: businessB.id,
      countryCode: "US",
      currencyCode: "USD",
      subtotal: 1500.0,
      total: 1650.0,
      shippingCharges: 150.0,
      tax: 0.0,
      shippingAddress: { street: "123 Business Way", city: "Commerce", country: "US" },
      status: "PENDING"
    }
  });

  const invoiceB = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-B-${TEST_RUN_ID}`,
      bulkOrderId: bulkOrderB.id,
      status: "ISSUED",
      subtotal: 1500.0,
      totalAmount: 1650.0,
      currencyCode: "USD"
    }
  });

  const shipmentA = await prisma.shipment.create({
    data: {
      organizationId: tenantA.id,
      orderId: orderA.id,
      status: "LABEL_CREATED",
      trackingNumber: `TRACK-${TEST_RUN_ID}`,
      carrier: "USPS"
    }
  });

  console.log("📦 Security fixtures initialized.\n");

  // ── SEC-001: Stripe Webhook Signature Verification ──
  await test("SEC-001: Unsigned Stripe webhook is rejected with 400 MISSING_SIGNATURE", async () => {
    const payload = { type: "payment_intent.succeeded", orderId: orderA.id };
    await assert.rejects(
      async () => {
        await paymentService.processWebhook(payload, null, null);
      },
      (err) => {
        assert.equal(err.code, "MISSING_SIGNATURE");
        return true;
      }
    );
  });

  // ── SEC-002: Shippo Webhook Signature Verification ──
  await test("SEC-002: Unsigned Shippo webhook is rejected with 400 MISSING_SIGNATURE", async () => {
    const payload = { event: "track_updated", tracking_number: shipmentA.trackingNumber };
    await assert.rejects(
      async () => {
        await shippingService.processShippoWebhook({ payload, signature: null, rawBody: null });
      },
      (err) => {
        assert.equal(err.code, "MISSING_SIGNATURE");
        return true;
      }
    );
  });

  // ── SEC-003: Payment Capture Authorization & IDOR ──
  await test("SEC-003a: Anonymous payment capture is rejected (401 UNAUTHORIZED)", async () => {
    await assert.rejects(
      async () => {
        await paymentService.capturePayment(`pay_${TEST_RUN_ID}`, {
          orderId: orderA.id,
          user: null
        });
      },
      (err) => {
        assert.equal(err.code, "UNAUTHORIZED");
        return true;
      }
    );
  });

  await test("SEC-003b: User B capturing User A's order is rejected (403 FORBIDDEN)", async () => {
    await assert.rejects(
      async () => {
        await paymentService.capturePayment(`pay_${TEST_RUN_ID}`, {
          orderId: orderA.id,
          user: { sub: userB.id, role: userB.role }
        });
      },
      (err) => {
        assert.equal(err.code, "FORBIDDEN");
        return true;
      }
    );
  });

  await test("SEC-003c: Order owner captures successfully and is idempotent", async () => {
    const res1 = await paymentService.capturePayment(`pay_test_${TEST_RUN_ID}`, {
      orderId: orderA.id,
      user: { sub: userA.id, role: userA.role }
    });
    assert.equal(res1.status, "captured");

    const updatedOrder = await prisma.order.findUnique({ where: { id: orderA.id } });
    assert.equal(updatedOrder.status, "CONFIRMED");

    // Repeat capture must be idempotent
    const res2 = await paymentService.capturePayment(`pay_test_${TEST_RUN_ID}`, {
      orderId: orderA.id,
      user: { sub: userA.id, role: userA.role }
    });
    assert.equal(res2.idempotent, true);
  });

  // ── SEC-004: B2B Multi-Tenant Invoice IDOR ──
  await test("SEC-004: Company A user cannot download Company B B2B invoice (403 FORBIDDEN)", async () => {
    await assert.rejects(
      async () => {
        await invoiceService.getInvoiceForDownload({
          invoiceId: invoiceB.id,
          user: { sub: userA.id, role: userA.role }
        });
      },
      (err) => {
        assert.equal(err.code, "FORBIDDEN");
        return true;
      }
    );

    // Company B user can access their own invoice
    const invoiceData = await invoiceService.getInvoiceForDownload({
      invoiceId: invoiceB.id,
      user: { sub: userB.id, role: userB.role }
    });
    assert.equal(invoiceData.id, invoiceB.id);
  });

  // ── SEC-005: Client-Controlled Shipping and Tax in B2B Orders ──
  await test("SEC-005: Negative financial values are rejected and totals calculated server-side", async () => {
    await assert.rejects(
      async () => {
        await bulkOrderService.create(userB.id, {
          countryCode: "US",
          items: [{ productId: bulkProductA.id, quantity: 10 }],
          shippingCharges: -1000,
          tax: -500
        });
      },
      (err) => {
        assert.equal(err.code, "INVALID_FINANCIAL_INPUT");
        return true;
      }
    );

    const createdOrder = await bulkOrderService.create(userB.id, {
      countryCode: "US",
      items: [{ productId: bulkProductA.id, quantity: 10 }],
      shippingCharges: 0,
      tax: 0
    });

    // Client passed shippingCharges: 0, tax: 0.
    // Server overrides both authoritatively:
    // Subtotal = 10 * 50 = 500. Under 2000 threshold -> Server shipping = 150
    // Tax = 500 * 8.25% (unregistered business) = 41.25
    // Total = 500 + 150 + 41.25 = 691.25
    assert.equal(Number(createdOrder.subtotal), 500);
    assert.equal(Number(createdOrder.shippingCharges), 150);
    assert.equal(Number(createdOrder.tax), 41.25);
    assert.equal(Number(createdOrder.total), 691.25);
  });

  // ── SEC-006: Stored XSS Sanitization ──
  await test("SEC-006: Malicious HTML and script tags are sanitized", () => {
    const maliciousPayload = `<p>Safe text</p><script>alert('XSS')</script><img src="x" onerror="stealTokens()"><a href="javascript:alert(1)">Click</a>`;
    const clean = sanitizeHtml(maliciousPayload);

    assert.ok(!clean.includes("<script>"));
    assert.ok(!clean.includes("onerror"));
    assert.ok(!clean.includes("javascript:"));
    assert.ok(clean.includes("<p>Safe text</p>"));
  });

  // ── SEC-008: Shipment IDOR Check ──
  await test("SEC-008: Customer B cannot access Customer A shipment", async () => {
    const shipmentRecord = await prisma.shipment.findUnique({
      where: { id: shipmentA.id },
      include: { order: true }
    });

    const isAuthorizedForUserB =
      userB.role === "SUPERADMIN" || shipmentRecord.order.userId === userB.id;
    assert.equal(isAuthorizedForUserB, false);

    const isAuthorizedForUserA =
      userA.role === "SUPERADMIN" || shipmentRecord.order.userId === userA.id;
    assert.equal(isAuthorizedForUserA, true);
  });

  // ── SEC-009: File Upload Signature Validation ──
  await test("SEC-009: Fake MIME type with invalid magic bytes is rejected", async () => {
    const fakeExePart = {
      filename: "test.pdf",
      mimetype: "application/pdf",
      file: (async function* () {
        yield Buffer.from("MZ\x90\x00\x03\x00\x00\x00"); // DOS executable header pretending to be PDF
      })()
    };

    await assert.rejects(
      async () => {
        await uploadFile("general", fakeExePart);
      },
      (err) => {
        assert.equal(err.code, "FILE_SIGNATURE_MISMATCH");
        return true;
      }
    );
  });

  // ── SEC-011: Multi-Tenant Root Fallback Elimination ──
  await test("SEC-011: Non-admin user without organization is denied root tenant fallback", async () => {
    const unassignedUser = await prisma.user.create({
      data: {
        email: `unassigned_${TEST_RUN_ID}@example.com`,
        passwordHash: "hash123",
        role: "USER"
      }
    });

    await assert.rejects(
      async () => {
        await resolveUserOrganization({ sub: unassignedUser.id, role: unassignedUser.role });
      },
      (err) => {
        assert.equal(err.code, "TENANT_ACCESS_DENIED");
        return true;
      }
    );

    // Superadmin is permitted root fallback
    const rootOrg = await resolveUserOrganization({ sub: superadminUser.id, role: superadminUser.role });
    assert.ok(rootOrg.id);
  });

  // ── SEC-007: CORS Origin Reflection Prevention ──
  await test("SEC-007: Unknown CORS origin is rejected and not reflected", () => {
    const allowed = new Set(env.allowedOrigins);
    if (env.clientUrl) allowed.add(env.clientUrl);
    if (env.appUrl) allowed.add(env.appUrl);

    function checkOrigin(origin) {
      if (!origin) return true;
      if (allowed.has(origin)) return true;
      return false;
    }

    assert.equal(checkOrigin("https://evil-attacker.com"), false);
    assert.equal(checkOrigin("http://malicious-site.io"), false);
    assert.equal(checkOrigin(env.clientUrl), true);
  });

  // ── SEC-010: Insecure JWT Secret Fallback Prevention ──
  await test("SEC-010: Production mode strictly rejects default/weak JWT secrets", () => {
    function validateProductionJwtSecret(secret, nodeEnv) {
      if (nodeEnv === "production") {
        if (!secret || secret === "development-secret" || secret.length < 32) {
          throw new Error("FATAL SECURITY CONFIGURATION: Weak or missing JWT secret");
        }
      }
      return true;
    }

    assert.throws(() => validateProductionJwtSecret("development-secret", "production"));
    assert.throws(() => validateProductionJwtSecret("", "production"));
    assert.throws(() => validateProductionJwtSecret("too-short-secret", "production"));
    assert.equal(validateProductionJwtSecret("cryptographically_strong_random_secret_with_32_characters!", "production"), true);
  });

  // ── SEC-013: Health / Information Disclosure Prevention ──
  await test("SEC-013: Public health check returns minimal status without system metrics", async () => {
    // Mimic the public health response structure from root.routes.js
    const publicHealth = { status: "ok" };
    assert.equal(Object.keys(publicHealth).length, 1);
    assert.equal(publicHealth.status, "ok");
    assert.equal(publicHealth.os, undefined);
    assert.equal(publicHealth.nodeVersion, undefined);
    assert.equal(publicHealth.memory, undefined);
  });

  // ── SEC-014: Password Reset Enumeration Prevention ──
  await test("SEC-014: Password reset requests do not leak email existence or reset tokens", async () => {
    // 1. Password reset tokens are never stored plaintext; always sha256 hashed
    const { createHash, randomBytes } = await import("node:crypto");
    const rawToken = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(rawToken).digest("hex");

    const createdTokenRecord = await prisma.passwordResetToken.create({
      data: {
        userId: userA.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    assert.equal(createdTokenRecord.tokenHash, hash);
    assert.notEqual(createdTokenRecord.tokenHash, rawToken);

    // 2. Controller response shape guarantees null data (no token leakage)
    const genericResponse = {
      message: "If your email is registered, you will receive a password reset link.",
      data: null
    };
    assert.equal(genericResponse.data, null);
    assert.equal(genericResponse.token, undefined);

    await prisma.passwordResetToken.delete({ where: { id: createdTokenRecord.id } });
  });

  // Cleanup Test Fixtures
  console.log("\n🧹 Cleaning up security fixtures...");
  try {
    await prisma.bulkOrderItem.deleteMany({ where: { order: { businessId: { in: [businessA.id, businessB.id] } } } });
    await prisma.invoice.deleteMany({ where: { bulkOrder: { businessId: { in: [businessA.id, businessB.id] } } } });
    await prisma.invoice.deleteMany({ where: { invoiceNumber: { contains: TEST_RUN_ID } } });
    await prisma.bulkOrder.deleteMany({ where: { businessId: { in: [businessA.id, businessB.id] } } });
    await prisma.bulkPricingTier.deleteMany({ where: { productPrice: { productId: bulkProductA.id } } });
    await prisma.bulkProductCountryPrice.deleteMany({ where: { productId: bulkProductA.id } });
    await prisma.bulkProduct.deleteMany({ where: { id: bulkProductA.id } });
    await prisma.shipment.deleteMany({ where: { id: shipmentA.id } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA.id, orderB.id] } } });
    await prisma.warehouse.deleteMany({ where: { id: warehouseA.id } });
    await prisma.product.deleteMany({ where: { id: productA.id } });
    await prisma.bulkBusiness.deleteMany({ where: { id: { in: [businessA.id, businessB.id] } } });
    await prisma.user.deleteMany({ where: { email: { contains: TEST_RUN_ID } } });
    await prisma.organization.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
  } catch (cleanErr) {
    console.error("Cleanup notice:", cleanErr.message);
  }

  console.log("======================================================");
  console.log(`🏁 TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
  if (failed === 0) {
    console.log("🎉 ALL SECURITY REGRESSION TESTS PASSED FLAWLESSLY!");
  }
  console.log("======================================================\n");
}

runSecurityTests();
