import { env } from "../../config/env.js";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import nodemailer from "nodemailer";
import {
  renderPasswordResetEmail,
  renderVerifyEmail,
  renderContactInquiryAdminEmail,
  renderContactInquiryCustomerEmail,
} from "../../emails/index.js";

function required(value, name) {
  if (!value) throw new Error(`${name} is required for email sending`);
  return value;
}

async function sendWithResend({ to, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${required(env.resendApiKey, "RESEND_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: required(env.emailFrom, "EMAIL_FROM"),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Email provider failed with ${response.status}: ${errorBody}`);
  }
  return response.json();
}

async function sendWithSes({ to, subject, html, text }) {
  const client = new SESv2Client({ region: env.awsRegion });
  return client.send(new SendEmailCommand({
    FromEmailAddress: required(env.emailFrom, "EMAIL_FROM"),
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text }, Html: { Data: html } } } }
  }));
}

let smtpTransporter;
function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: required(env.smtpHost, "SMTP_HOST"),
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined
    });
  }
  return smtpTransporter;
}

async function sendWithSmtp({ to, subject, html, text }) {
  const transporter = getSmtpTransporter();
  const info = await transporter.sendMail({
    from: required(env.emailFrom, "EMAIL_FROM"),
    to,
    subject,
    text,
    html
  });
  console.info(`[email:smtp] sent to=${to} id=${info.messageId} response=${info.response}`);
  return info;
}

async function sendWithConsole({ to, subject, text }) {
  console.info(`[email:console] to=${Array.isArray(to) ? to.join(",") : to} subject=${subject}\n${text}`);
  return { id: "console-email" };
}

export async function sendEmail(message) {
  if (env.emailProvider === "resend") return sendWithResend(message);
  if (env.emailProvider === "ses") return sendWithSes(message);
  if (env.emailProvider === "smtp") return sendWithSmtp(message);
  if (env.emailProvider === "console") return sendWithConsole(message);
  throw new Error(`Unsupported email provider: ${env.emailProvider}`);
}

export async function sendSms({ to, message }) {
  if (env.smsProvider === "console") {
    console.info(`[sms:console] to=${to} message=${message}`);
    return { id: "console-sms" };
  }
  if (env.smsProvider !== "sns") throw new Error(`Unsupported SMS provider: ${env.smsProvider}`);
  return new SNSClient({ region: env.awsRegion }).send(new PublishCommand({ PhoneNumber: to, Message: message }));
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${(env.clientUrl || env.appUrl).replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const template = await renderPasswordResetEmail({
    resetUrl,
    expiresInMinutes: env.passwordResetExpiresMinutes
  });
  return sendEmail({
    to: email,
    ...template
  });
}

export async function sendVerificationEmail(email, token, options = {}) {
  const verifyUrl = `${(env.clientUrl || env.appUrl).replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const template = await renderVerifyEmail({
    verifyUrl,
    firstName: options.firstName,
    businessName: options.businessName,
    businessEmail: options.businessEmail,
    businessPhone: options.businessPhone,
    taxRegistrationNumber: options.taxRegistrationNumber,
    registrationNumber: options.registrationNumber,
    address: options.address,
    isB2B: options.isB2B,
  });
  return sendEmail({ to: email, ...template });
}

/**
 * Sends contact inquiry emails using React Email templates:
 * 1. Notification to Store Admin / Support Team
 * 2. Confirmation acknowledgement to Customer
 */
export async function sendContactNotificationEmails({ name, email, phone, subject, message, store = null }) {
  const storeName = store?.storeName || "Vanom";
  const adminEmail = store?.supportEmail || store?.email || env.emailFrom || "corporate.billing@vanom-global.com";

  const promises = [];

  // 1. Render & Send Admin Notification via React Email
  try {
    const adminTemplate = await renderContactInquiryAdminEmail({
      name,
      email,
      phone,
      subject,
      message,
      storeName
    });

    promises.push(
      sendEmail({
        to: adminEmail,
        ...adminTemplate
      }).catch((err) => console.warn("[email:contact-admin-failed]", err.message))
    );
  } catch (err) {
    console.error("[email:render-admin-template-failed]", err);
  }

  // 2. Render & Send Customer Acknowledgement via React Email
  try {
    const customerTemplate = await renderContactInquiryCustomerEmail({
      name,
      subject,
      message,
      storeName
    });

    promises.push(
      sendEmail({
        to: email,
        ...customerTemplate
      }).catch((err) => console.warn("[email:contact-customer-failed]", err.message))
    );
  } catch (err) {
    console.error("[email:render-customer-template-failed]", err);
  }

  await Promise.all(promises);
}

