import { renderEmail } from "./email.renderer.js";
import { dispatchEmail } from "./email.provider.js";
import { env } from "../config/env.js";

/**
 * Universal email sender helper
 */
export async function sendEmail({ to, subject, template, data = {} }) {
  const { html, text } = await renderEmail(template, {
    title: subject,
    preview: data.preview || subject,
    ...data,
  });

  return dispatchEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Auth: Welcome Email
 */
export async function sendWelcomeEmail({ email, firstName }) {
  const subject = "Welcome to Vanom!";
  return sendEmail({
    to: email,
    subject,
    template: "auth/welcome.html",
    data: {
      firstName: firstName || "there",
      preview: "Welcome to Vanom!",
    },
  });
}

function normalizeAuthEmailArgs(emailOrPayload, token, options = {}) {
  if (emailOrPayload && typeof emailOrPayload === "object") {
    return emailOrPayload;
  }
  return { email: emailOrPayload, token, ...options };
}

/**
 * Auth: Email Verification
 */
export async function sendVerificationEmail(emailOrPayload, tokenArg, optionsArg) {
  const { email, token, firstName, ...options } = normalizeAuthEmailArgs(emailOrPayload, tokenArg, optionsArg);
  const verifyUrl = `${(env.clientUrl || "http://localhost:5173").replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const subject = options.isB2B
    ? `Verify your Vanom Wholesale Account - ${options.businessName || "Business"}`
    : "Verify your Vanom email";

  return sendEmail({
    to: email,
    subject,
    template: "auth/verify-email.html",
    data: {
      verifyUrl,
      firstName,
      preview: options.isB2B ? "Verify your Vanom Wholesale account" : "Verify your Vanom account",
      ...options,
    },
  });
}

/**
 * Auth: Password Reset / Forgot Password
 */
export async function sendPasswordResetEmail(emailOrPayload, tokenArg, optionsArg) {
  const { email, token, firstName, requestedFrom } = normalizeAuthEmailArgs(emailOrPayload, tokenArg, optionsArg);
  const resetUrl = `${(env.clientUrl || "http://localhost:5173").replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Reset your Vanom password";

  return sendEmail({
    to: email,
    subject,
    template: "auth/password-reset.html",
    data: {
      email,
      firstName,
      resetUrl,
      requestedFrom,
      expiresInMinutes: env.passwordResetExpiresMinutes || 30,
      preview: "Reset your Vanom password",
    },
  });
}

export const sendForgotPasswordEmail = sendPasswordResetEmail;

/**
 * Users: Team Invitation
 */
export async function sendInvitationEmail({ email, name, organizationName, role, inviteUrl, inviterName }) {
  const subject = `You have been invited to join ${organizationName} on Vanom`;

  return sendEmail({
    to: email,
    subject,
    template: "users/invitation.html",
    data: {
      name: name || "there",
      organizationName,
      role: role || "Member",
      inviteUrl,
      inviterName: inviterName || "Team Administrator",
      preview: `Invitation to join ${organizationName}`,
    },
  });
}

/**
 * Orders: Order Confirmation
 */
export async function sendOrderConfirmationEmail({ email, order }) {
  const subject = `Your order #${order.id} is confirmed`;

  return sendEmail({
    to: email,
    subject,
    template: "orders/order-confirmation.html",
    data: {
      order,
      preview: `Your order #${order.id} is confirmed`,
    },
  });
}

/**
 * Orders: Order Shipped
 */
export async function sendOrderShippedEmail({ email, orderId, trackingUrl }) {
  const subject = `Your order #${orderId} has shipped!`;

  return sendEmail({
    to: email,
    subject,
    template: "orders/order-shipped.html",
    data: {
      orderId,
      trackingUrl,
      preview: `Your order #${orderId} has shipped`,
    },
  });
}

/**
 * Contact: Inquiries (Admin + Customer Acknowledgement)
 */
export async function sendContactNotificationEmails({ name, email, phone, subject, message, store = null }) {
  const storeName = store?.storeName || "Vanom";
  const adminEmail = store?.supportEmail || store?.email || env.emailFrom || "support@vanom.com";
  const adminPortalUrl = `${(env.clientUrl || "http://localhost:5173").replace(/\/$/, "")}/admin/messages`;

  const promises = [];

  // 1. Notify Admin
  promises.push(
    sendEmail({
      to: adminEmail,
      subject: `[New Inquiry] ${subject || "Customer Inquiry"} - ${name || "Customer"}`,
      template: "contact/inquiry-admin.html",
      data: {
        name,
        email,
        phone,
        subject: subject || "Customer Inquiry",
        message,
        storeName,
        adminPortalUrl,
        preview: `New inquiry from ${name}`,
      },
    }).catch((err) => console.warn("[email:contact-admin-failed]", err.message))
  );

  // 2. Acknowledge Customer
  promises.push(
    sendEmail({
      to: email,
      subject: `We've received your message - ${storeName}`,
      template: "contact/inquiry-customer.html",
      data: {
        name,
        subject: subject || "Your inquiry",
        message,
        storeName,
        preview: `Thank you for contacting ${storeName}`,
      },
    }).catch((err) => console.warn("[email:contact-customer-failed]", err.message))
  );

  return Promise.all(promises);
}

function getClientOrderUrl(orderId, isBulk = false) {
  const base = (env.clientUrl || "http://localhost:5173").replace(/\/$/, "");
  if (!orderId) return base;
  return isBulk ? `${base}/b2b/orders/${orderId}` : `${base}/orders/${orderId}`;
}

function formatOrderRef(orderId, orderNumber) {
  if (orderNumber) return orderNumber;
  return orderId ? `ORD-${String(orderId).slice(0, 8).toUpperCase()}` : "N/A";
}

/**
 * Orders: Order Booked / Placed (B2C & B2B Bulk)
 */
export async function sendOrderBookedEmail({ email, firstName, order, isBulk = false }) {
  if (!email || !order) return null;
  const orderNumber = formatOrderRef(order.id, order.orderNumber);
  const orderUrl = getClientOrderUrl(order.id, isBulk);
  const subject = isBulk
    ? `Wholesale Order #${orderNumber} Placed (Payment Pending)`
    : `Your Vanom Order #${orderNumber} is Placed (Payment Pending)`;

  return sendEmail({
    to: email,
    subject,
    template: "orders/order-booked.html",
    data: {
      firstName,
      orderNumber,
      status: order.status || null,
      order,
      isBulk,
      orderUrl,
      preview: subject,
    },
  });
}

const ORDER_STATUS_MESSAGES = {
  CONFIRMED: "Your order has been confirmed and is being prepared.",
  PROCESSING: "Your order is currently being processed by our fulfillment team.",
  PACKED: "Your items have been packed and are awaiting carrier pickup.",
  SHIPPED: "Your order is on its way!",
  DELIVERED: "Your order has been delivered. We hope you enjoy your purchase!",
  CANCELLED: "Your order has been cancelled. Any reserved stock or pending charges have been released.",
  REFUNDED: "Your order has been refunded.",
};

/**
 * Orders: Order Status Updated (B2C & B2B Bulk)
 */
export async function sendOrderStatusChangedEmail({
  email,
  firstName,
  orderId,
  orderNumber: explicitOrderNumber,
  status,
  previousStatus = null,
  paymentStatus = null,
  shippingStatus = null,
  trackingNumber = null,
  trackingUrl = null,
  reason = null,
  isBulk = false,
}) {
  if (!email || !status) return null;
  const orderNumber = formatOrderRef(orderId, explicitOrderNumber);
  const orderUrl = getClientOrderUrl(orderId, isBulk);
  const normalizedStatus = String(status).toUpperCase();
  const subject = `Order #${orderNumber} Status: ${normalizedStatus}`;

  return sendEmail({
    to: email,
    subject,
    template: "orders/order-status-updated.html",
    data: {
      firstName,
      orderNumber,
      status: normalizedStatus,
      previousStatus: previousStatus ? String(previousStatus).toUpperCase() : null,
      paymentStatus: paymentStatus ? String(paymentStatus).toUpperCase() : null,
      shippingStatus: shippingStatus ? String(shippingStatus).toUpperCase() : null,
      trackingNumber,
      trackingUrl,
      reason,
      statusMessage: ORDER_STATUS_MESSAGES[normalizedStatus] || null,
      isBulk,
      orderUrl,
      preview: subject,
    },
  });
}

const PAYMENT_STATUS_META = {
  SUCCEEDED: {
    subjectPrefix: "Payment Confirmed",
    headline: "Payment Confirmed",
    statusLabel: "PAID",
    introText: "your payment has been successfully processed.",
    accentColor: "#0B4627",
    noticeTitle: "Payment Note",
    ctaLabel: "View Order Details",
  },
  FAILED: {
    subjectPrefix: "Payment Failed",
    headline: "Payment Could Not Be Processed",
    statusLabel: "FAILED",
    introText: "we were unable to process your payment for this order.",
    accentColor: "#C53030",
    noticeTitle: "Failure Details",
    ctaLabel: "Review Order",
  },
  REFUNDED: {
    subjectPrefix: "Refund Processed",
    headline: "Refund Processed",
    statusLabel: "REFUNDED",
    introText: "your refund has been initiated and will appear on your statement shortly.",
    accentColor: "#1E40AF",
    noticeTitle: "Refund Reason",
    ctaLabel: "View Order Details",
  },
};

/**
 * Payments: Payment Succeeded / Failed / Refunded
 */
export async function sendPaymentStatusEmail({
  email,
  firstName,
  orderId,
  orderNumber: explicitOrderNumber,
  status = "SUCCEEDED",
  amount = null,
  currencyCode = "USD",
  paymentId = null,
  reason = null,
  isBulk = false,
}) {
  if (!email) return null;
  const key = String(status).toUpperCase();
  const meta = PAYMENT_STATUS_META[key] || PAYMENT_STATUS_META.SUCCEEDED;
  const orderNumber = formatOrderRef(orderId, explicitOrderNumber);
  const ctaUrl = getClientOrderUrl(orderId, isBulk);
  const subject = `${meta.subjectPrefix} — Order #${orderNumber}`;

  return sendEmail({
    to: email,
    subject,
    template: "payments/payment-status.html",
    data: {
      firstName,
      orderNumber,
      amount: amount != null ? Number(amount).toFixed(2) : null,
      currencyCode,
      paymentId,
      reason,
      ...meta,
      ctaUrl,
      preview: subject,
    },
  });
}
