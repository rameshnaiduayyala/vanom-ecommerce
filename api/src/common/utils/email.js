import { env } from "../../config/env.js";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import nodemailer from "nodemailer";
import { renderPasswordResetEmail, renderVerifyEmail } from "../../emails/index.js";

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
  if (!smtpTransporter) smtpTransporter = nodemailer.createTransport({
    host: required(env.smtpHost, "SMTP_HOST"), port: env.smtpPort, secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined
  });
  return smtpTransporter;
}

async function sendWithSmtp({ to, subject, html, text }) {
  return getSmtpTransporter().sendMail({ from: required(env.emailFrom, "EMAIL_FROM"), to, subject, text, html });
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
  const resetUrl = `${env.appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const template = await renderPasswordResetEmail({
    resetUrl,
    expiresInMinutes: env.passwordResetExpiresMinutes
  });
  return sendEmail({
    to: email,
    ...template
  });
}

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${env.appUrl.replace(/\/$/, "")}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;
  const template = await renderVerifyEmail({ verifyUrl });
  return sendEmail({ to: email, ...template });
}
