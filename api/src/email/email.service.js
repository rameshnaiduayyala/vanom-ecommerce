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

/**
 * Auth: Email Verification
 */
export async function sendVerificationEmail({ email, token, firstName, ...options }) {
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
 * Auth: Password Reset
 */
export async function sendPasswordResetEmail({ email, token }) {
  const resetUrl = `${(env.clientUrl || "http://localhost:5173").replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Reset your password";

  return sendEmail({
    to: email,
    subject,
    template: "auth/password-reset.html",
    data: {
      resetUrl,
      expiresInMinutes: env.passwordResetExpiresMinutes || 30,
      preview: "Reset your Vanom password",
    },
  });
}

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
