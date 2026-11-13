import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  getCurrencyDecimalPlaces,
  getCurrencyMultiplier,
  toStripeAmount,
  fromStripeAmount,
  isCurrencyMatching,
  isAmountMatching
} from "../src/modules/payments/currency.utils.js";
import {
  generateGuestOrderAuth,
  hashGuestOrderToken,
  verifyGuestOrderToken
} from "../src/modules/payments/guest-auth.utils.js";
import {
  verifyOrderAccess,
  verifyOrderPayable,
  resolveTrustedRedirectUrls,
  PAYMENT_STATES,
  refundPayment,
  processWebhook
} from "../src/modules/payments/payment.service.js";
import { AppError } from "../src/common/errors/app-error.js";

async function runTests() {
  console.log("\n========================================================");
  console.log("🔒 STRIPE PAYMENT SECURITY REGRESSION SUITE");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (err) {
      failed++;
      console.log(`❌ FAILED: ${name}`);
      console.error("   Error:", err.message);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Currency Conversion & Smallest Unit Handling (Rule 2.2)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Currency Utils: Standard 2-decimal currency (USD, EUR, GBP, CAD)", () => {
    assert.equal(getCurrencyDecimalPlaces("USD"), 2);
    assert.equal(getCurrencyMultiplier("USD"), 100);
    assert.equal(toStripeAmount(49.99, "USD"), 4999);
    assert.equal(toStripeAmount(100, "usd"), 10000);
    assert.equal(fromStripeAmount(4999, "USD"), 49.99);
    assert.equal(isCurrencyMatching("USD", "usd"), true);
    assert.equal(isCurrencyMatching("usd", "eur"), false);
    assert.equal(isAmountMatching(49.99, 4999, "USD"), true);
    assert.equal(isAmountMatching(49.99, 4998, "USD"), false);
  });

  await test("Currency Utils: Zero-decimal currency (JPY, KRW, VND, BIF, etc.)", () => {
    assert.equal(getCurrencyDecimalPlaces("JPY"), 0);
    assert.equal(getCurrencyMultiplier("JPY"), 1);
    assert.equal(toStripeAmount(1500, "JPY"), 1500);
    assert.equal(fromStripeAmount(1500, "JPY"), 1500);
    assert.equal(isAmountMatching(1500, 1500, "JPY"), true);
    assert.equal(isAmountMatching(1500, 150000, "JPY"), false);
  });

  await test("Currency Utils: 3-decimal currency (BHD, KWD, OMR, TND, JOD)", () => {
    assert.equal(getCurrencyDecimalPlaces("KWD"), 3);
    assert.equal(getCurrencyMultiplier("KWD"), 1000);
    assert.equal(toStripeAmount(12.345, "KWD"), 12345);
    assert.equal(fromStripeAmount(12345, "KWD"), 12.345);
    assert.equal(isAmountMatching(12.345, 12345, "KWD"), true);
    assert.equal(isAmountMatching(12.345, 1234, "KWD"), false);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Cryptographic Guest Order Authentication (Rule 2.1)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Guest Auth: Generate secure random token and hash", () => {
    const auth = generateGuestOrderAuth(24);
    assert.ok(auth.rawToken && auth.rawToken.length === 64, "Raw token must be 32 bytes hex (64 chars)");
    assert.ok(auth.tokenHash && auth.tokenHash.length === 64, "Token hash must be SHA-256 (64 hex chars)");
    assert.equal(hashGuestOrderToken(auth.rawToken), auth.tokenHash, "Hash must be repeatable");
    assert.ok(new Date(auth.expiresAt).getTime() > Date.now(), "Expiry must be in the future");
  });

  await test("Guest Auth: Verify valid, invalid, and expired tokens with timing-safe comparison", () => {
    const auth = generateGuestOrderAuth(2);
    // Valid token
    assert.equal(verifyGuestOrderToken(auth.rawToken, auth.tokenHash, auth.expiresAt), true);

    // Tampered token
    const tampered = auth.rawToken.slice(0, -1) + (auth.rawToken.endsWith("a") ? "b" : "a");
    assert.equal(verifyGuestOrderToken(tampered, auth.tokenHash, auth.expiresAt), false);

    // Expired token
    const expiredTime = new Date(Date.now() - 1000).toISOString();
    assert.equal(verifyGuestOrderToken(auth.rawToken, auth.tokenHash, expiredTime), false);

    // Missing token
    assert.equal(verifyGuestOrderToken(null, auth.tokenHash, auth.expiresAt), false);
    assert.equal(verifyGuestOrderToken("", auth.tokenHash, auth.expiresAt), false);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Secure Order Access Control & IDOR Prevention (Rule 2.1)
  // ──────────────────────────────────────────────────────────────────────────
  const customerA = { id: "user_customer_A_123", role: "USER" };
  const customerB = { id: "user_customer_B_456", role: "USER" };
  const superadmin = { id: "user_admin_999", role: "SUPERADMIN" };

  const registeredOrder = {
    id: "ord_registered_001",
    userId: customerA.id,
    status: "PENDING_PAYMENT",
    total: 100.0,
    currencyCode: "USD",
    metadata: {}
  };

  await test("Order Access: Registered order requires authentication", () => {
    assert.throws(
      () => verifyOrderAccess(registeredOrder, { user: null }),
      (err) => err instanceof AppError && err.statusCode === 401
    );
  });

  await test("Order Access: Rejects cross-customer IDOR (User B accessing User A's order)", () => {
    assert.throws(
      () => verifyOrderAccess(registeredOrder, { user: customerB }),
      (err) => err instanceof AppError && err.statusCode === 403
    );
  });

  await test("Order Access: Allows legitimate order owner (User A)", () => {
    const allowed = verifyOrderAccess(registeredOrder, { user: customerA });
    assert.equal(allowed, true);
  });

  await test("Order Access: Allows SUPERADMIN to access order", () => {
    const allowed = verifyOrderAccess(registeredOrder, { user: superadmin });
    assert.equal(allowed, true);
  });

  // Guest order access
  const guestAuth = generateGuestOrderAuth(24);
  const guestOrder = {
    id: "ord_guest_002",
    userId: null,
    status: "PENDING_PAYMENT",
    total: 50.0,
    currencyCode: "USD",
    metadata: {
      isGuestOrder: true,
      guestOrderTokenHash: guestAuth.tokenHash,
      guestOrderTokenExpiresAt: guestAuth.expiresAt
    }
  };

  await test("Order Access: Guest order rejects request with missing or invalid token", () => {
    // Missing guest token
    assert.throws(
      () => verifyOrderAccess(guestOrder, { user: null, guestToken: null }),
      (err) => err instanceof AppError && (err.statusCode === 401 || err.statusCode === 403)
    );

    // Wrong guest token
    assert.throws(
      () => verifyOrderAccess(guestOrder, { user: null, guestToken: "wrong_fake_token_123" }),
      (err) => err instanceof AppError && (err.statusCode === 401 || err.statusCode === 403)
    );
  });

  await test("Order Access: Guest order allows access with valid cryptographic token", () => {
    const allowed = verifyOrderAccess(guestOrder, { user: null, guestToken: guestAuth.rawToken });
    assert.equal(allowed, true);
  });

  await test("Order Access: Guest order rejects expired guest token", () => {
    const expiredGuestOrder = {
      ...guestOrder,
      metadata: {
        ...guestOrder.metadata,
        guestOrderTokenExpiresAt: new Date(Date.now() - 5000).toISOString()
      }
    };

    assert.throws(
      () => verifyOrderAccess(expiredGuestOrder, { user: null, guestToken: guestAuth.rawToken }),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === "GUEST_TOKEN_EXPIRED"
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Order Payable Verification (Rule 2.1)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Order Payable: Rejects CANCELLED, REFUNDED, or already CONFIRMED orders", () => {
    const cancelledOrder = { ...registeredOrder, status: "CANCELLED" };
    assert.throws(
      () => verifyOrderPayable(cancelledOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "ORDER_CANCELLED"
    );

    const refundedOrder = {
      ...registeredOrder,
      status: "PENDING_PAYMENT",
      metadata: { paymentStatus: PAYMENT_STATES.REFUNDED }
    };
    assert.throws(
      () => verifyOrderPayable(refundedOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "ORDER_REFUNDED"
    );

    const paidOrder = { ...registeredOrder, status: "CONFIRMED" };
    assert.throws(
      () => verifyOrderPayable(paidOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "ORDER_ALREADY_PAID"
    );

    const capturedOrder = {
      ...registeredOrder,
      status: "PENDING_PAYMENT",
      metadata: { paymentStatus: PAYMENT_STATES.CAPTURED }
    };
    assert.throws(
      () => verifyOrderPayable(capturedOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "ORDER_ALREADY_PAID"
    );
  });

  await test("Order Payable: Rejects non-positive or missing financial amounts", () => {
    const zeroOrder = { ...registeredOrder, total: 0 };
    assert.throws(
      () => verifyOrderPayable(zeroOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "INVALID_ORDER_AMOUNT"
    );

    const negativeOrder = { ...registeredOrder, total: -25 };
    assert.throws(
      () => verifyOrderPayable(negativeOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "INVALID_ORDER_AMOUNT"
    );

    const noCurrencyOrder = { ...registeredOrder, currencyCode: null };
    assert.throws(
      () => verifyOrderPayable(noCurrencyOrder),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "INVALID_ORDER_CURRENCY"
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Open Redirect Prevention (Rule 2.5)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Open Redirect Prevention: Rejects arbitrary external redirect URLs", () => {
    const malicious = resolveTrustedRedirectUrls("ord_123", {
      successUrl: "https://attacker.com/steal-creds?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://evil.phishing.org/cancel"
    });

    assert.ok(
      !malicious.successUrl.startsWith("https://attacker.com"),
      "Must not redirect to external attacker URL"
    );
    assert.ok(
      !malicious.cancelUrl.startsWith("http://evil.phishing.org"),
      "Must not redirect to external phishing URL"
    );
    assert.ok(
      malicious.successUrl.includes("/checkout/payment-success"),
      "Must fallback to trusted application route"
    );
    assert.ok(
      malicious.cancelUrl.includes("/checkout/payment-cancelled"),
      "Must fallback to trusted application route"
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Payment States Constant Verification (Rule 2.3)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Payment States: Distinct enterprise payment states supported", () => {
    assert.equal(PAYMENT_STATES.PENDING_PAYMENT, "PENDING_PAYMENT");
    assert.equal(PAYMENT_STATES.REQUIRES_ACTION, "REQUIRES_ACTION");
    assert.equal(PAYMENT_STATES.AUTHORIZED, "AUTHORIZED");
    assert.equal(PAYMENT_STATES.CAPTURED, "CAPTURED");
    assert.equal(PAYMENT_STATES.PAYMENT_FAILED, "PAYMENT_FAILED");
    assert.equal(PAYMENT_STATES.PARTIALLY_REFUNDED, "PARTIALLY_REFUNDED");
    assert.equal(PAYMENT_STATES.REFUNDED, "REFUNDED");
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Secure Refunds Authorization (Rule 2.6)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Secure Refunds: Strictly requires SUPERADMIN role", async () => {
    // Unauthenticated user
    await assert.rejects(
      async () => refundPayment("pi_mock_123", { user: null }),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === "ADMIN_REQUIRED"
    );

    // Regular authenticated customer
    await assert.rejects(
      async () => refundPayment("pi_mock_123", { user: customerA }),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === "ADMIN_REQUIRED"
    );

    // Non-superadmin role (e.g. B2B_USER or ADMIN)
    await assert.rejects(
      async () => refundPayment("pi_mock_123", { user: { id: "mgr_1", role: "ADMIN" } }),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === "ADMIN_REQUIRED"
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Secure Stripe Webhook Signature Verification (Rule 2.4)
  // ──────────────────────────────────────────────────────────────────────────
  await test("Webhook Security: Rejects webhook calls missing signature header", async () => {
    await assert.rejects(
      async () => processWebhook({ id: "evt_123" }, null, null),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "MISSING_SIGNATURE"
    );

    await assert.rejects(
      async () => processWebhook({ id: "evt_123" }, "", null),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === "MISSING_SIGNATURE"
    );
  });

  console.log("\n========================================================");
  console.log(`🏁 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
