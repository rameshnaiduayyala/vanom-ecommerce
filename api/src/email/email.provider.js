import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoFilePath = path.resolve(__dirname, "../../assets/logo.png");
let cachedLogoBuffer = null;

function getInlineLogoBuffer(html) {
  if (!html || !html.includes("cid:vanom-logo")) return null;
  if (!cachedLogoBuffer && fs.existsSync(logoFilePath)) {
    cachedLogoBuffer = fs.readFileSync(logoFilePath);
  }
  return cachedLogoBuffer;
}

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
  const logoBuffer = getInlineLogoBuffer(html);
  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  };
  if (logoBuffer) {
    payload.attachments = [
      {
        filename: "logo.png",
        content: logoBuffer.toString("base64"),
        content_id: "vanom-logo",
      },
    ];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv(env.resendApiKey, "RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
  const logoBuffer = getInlineLogoBuffer(html);
  return transporter.sendMail({
    from,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text,
    ...(logoBuffer
      ? {
          attachments: [
            {
              filename: "logo.png",
              content: logoBuffer,
              cid: "vanom-logo",
            },
          ],
        }
      : {}),
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

let papercutTransporter = null;
function getPapercutTransporter() {
  if (!papercutTransporter) {
    const host = env.papercutHost || env.smtpHost || "127.0.0.1";
    const port = env.papercutPort || env.smtpPort || 25;
    papercutTransporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      ignoreTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return papercutTransporter;
}

/**
 * Papercut Local SMTP Provider (Development Mode)
 */
async function sendViaPapercut({ to, from, subject, html, text }) {
  const host = env.papercutHost || env.smtpHost || "127.0.0.1";
  const port = env.papercutPort || env.smtpPort || 25;
  const transporter = getPapercutTransporter();
  const logoBuffer = getInlineLogoBuffer(html);

  try {
    const result = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text,
      ...(logoBuffer
        ? {
            attachments: [
              {
                filename: "logo.png",
                content: logoBuffer,
                cid: "vanom-logo",
              },
            ],
          }
        : {}),
    });

    console.log(`[Email] 📬 Successfully delivered to local Papercut SMTP (${host}:${port}) -> ${Array.isArray(to) ? to.join(", ") : to} [Subject: "${subject}"]`);
    return result;
  } catch (err) {
    console.error(`[Email] ⚠️ Could not connect to Papercut SMTP on ${host}:${port} (${err.message}).`);
    console.log("[Email] Outputting email to console instead:");
    await sendViaConsole({ to, from, subject, text });
    return { id: "papercut-fallback-console", status: "logged", error: err.message };
  }
}

/**
 * Dispatches an email through the provider configured in `EMAIL_PROVIDER`.
 * In development mode, automatically routes all emails to the local Papercut SMTP server.
 *
 * @param {{ to: string|string[], subject: string, html: string, text?: string }} options
 */
export async function dispatchEmail({ to, subject, html, text }) {
  const from = env.emailFrom || "noreply@vanom.com";
  const isDevelopment = env.nodeEnv === "development";
  const provider = (env.emailProvider || "console").toLowerCase();

  // In development mode (or when explicitly set to papercut), send to local Papercut SMTP
  if (isDevelopment || provider === "papercut") {
    return sendViaPapercut({ to, from, subject, html, text });
  }

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

