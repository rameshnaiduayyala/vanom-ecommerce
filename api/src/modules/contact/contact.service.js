import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendContactNotificationEmails } from "../../common/utils/email.js";

/**
 * Create a new contact inquiry from the storefront
 */
export async function createContactMessage(input, ipAddress = null) {
  if (!input.name || !input.email || !input.message) {
    throw new AppError("Name, email, and message are required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
  }

  // Basic email sanity check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new AppError("Invalid email address", HTTP_STATUS.BAD_REQUEST, "INVALID_EMAIL");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone ? String(input.phone).trim() : null;
  const subject = input.subject ? String(input.subject).trim() : "General Inquiry";
  const message = input.message.trim();

  // 1. Save to Database
  const created = await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone,
      subject,
      message,
      ipAddress: ipAddress || null
    }
  });

  // 2. Fetch Store Settings for email branding
  const store = await prisma.storeSetting.findFirst({
    orderBy: { createdAt: "asc" }
  }).catch(() => null);

  // 3. Dispatch Emails Asynchronously (non-blocking)
  sendContactNotificationEmails({
    name,
    email,
    phone,
    subject,
    message,
    store
  }).catch((err) => {
    console.error("[contact:email-dispatch-failed]", err?.message || err);
  });

  return created;
}

/**
 * List contact messages for Admin
 */
export async function listContactMessages({ page = 1, limit = 20, status = null, search = null }) {
  const skip = (page - 1) * limit;
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { message: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.contactMessage.count({ where })
  ]);

  return { items, total, page, limit };
}

/**
 * Update contact message status / notes (Admin)
 */
export async function updateContactMessage(id, input) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Contact message not found", HTTP_STATUS.NOT_FOUND, "MESSAGE_NOT_FOUND");
  }

  return await prisma.contactMessage.update({
    where: { id },
    data: {
      ...(input.status && { status: input.status }),
      ...(input.adminNotes !== undefined && { adminNotes: input.adminNotes }),
      ...(input.status === "REPLIED" && !existing.repliedAt && { repliedAt: new Date() })
    }
  });
}

/**
 * Delete a contact message (Admin)
 */
export async function deleteContactMessage(id) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Contact message not found", HTTP_STATUS.NOT_FOUND, "MESSAGE_NOT_FOUND");
  }

  return await prisma.contactMessage.delete({ where: { id } });
}
