import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { env } from "../config/env.js";

function requireEnv(value, name) {
  if (!value) throw new Error(`${name} is required for email sending`);
  return value;
}

let smtpTransporter = null;
function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: requireEnv(env.smtpHost, "SMTP_HOST"),
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined,
    });
  }
  return smtpTransporter;
}

/**
 * Resend HTTP Provider
 */
async function sendViaResend({ to, from, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv(env.resendApiKey, "RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend provider error (${response.status}): ${errorBody}`);
  }
  return response.json();
}

/**
 * AWS SES v2 Provider
 */
async function sendViaSes({ to, from, subject, html, text }) {
  const client = new SESv2Client({ region: env.awsRegion });
  return client.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: text },
            Html: { Data: html },
          },
        },
      },
    })
  );
}

/**
 * Nodemailer (SMTP / cPanel Mail / SendGrid / Mailgun)
 */
async function sendViaSmtp({ to, from, subject, html, text }) {
  const transporter = getSmtpTransporter();
  return transporter.sendMail({
    from,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text,
  });
}

/**
 * Console Mock Provider (Dev / Testing)
 */
async function sendViaConsole({ to, from, subject, text }) {
  console.log("\n================ [EMAIL DISPATCHED (CONSOLE)] ================");
  console.log(`From:    ${from}`);
  console.log(`To:      ${Array.isArray(to) ? to.join(", ") : to}`);
  console.log(`Subject: ${subject}`);
  console.log("---------------- Body ----------------");
  console.log(text || "(No plaintext)");
  console.log("==============================================================\n");
  return { id: "console-mock-id", status: "sent" };
}

/**
 * Dispatches an email through the provider configured in `EMAIL_PROVIDER`.
 *
 * @param {{ to: string|string[], subject: string, html: string, text?: string }} options
 */
export async function dispatchEmail({ to, subject, html, text }) {
  const from = env.emailFrom || "noreply@vanom.com";
  const provider = (env.emailProvider || "console").toLowerCase();

  switch (provider) {
    case "smtp":
      return sendViaSmtp({ to, from, subject, html, text });
    case "resend":
      return sendViaResend({ to, from, subject, html, text });
    case "ses":
      return sendViaSes({ to, from, subject, html, text });
    case "console":
    default:
      return sendViaConsole({ to, from, subject, text });
  }
}

