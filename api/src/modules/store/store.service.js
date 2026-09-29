import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

/**
 * Fetch the single store record.
 * Optionally initializes a default record if one does not exist.
 */
export async function getStore(autoCreateDefault = false) {
  let store = await prisma.storeSetting.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (!store && autoCreateDefault) {
    store = await prisma.storeSetting.create({
      data: {
        storeName: "Vanom",
        defaultCurrency: "USD"
      }
    });
  }

  return store;
}

/**
 * Create the store details.
 * Strictly permits only 1 store in the database.
 */
export async function createStore(input = {}) {
  const existingStore = await prisma.storeSetting.findFirst();
  if (existingStore) {
    throw new AppError(MESSAGES.STORE_ALREADY_EXISTS, HTTP_STATUS.CONFLICT, "STORE_ALREADY_EXISTS");
  }

  const data = sanitizeStoreInput(input);
  return await prisma.storeSetting.create({
    data
  });
}

/**
 * Update the single store details.
 * If no store exists yet, automatically creates one with the provided details.
 */
export async function updateStore(input = {}) {
  const existingStore = await prisma.storeSetting.findFirst({
    orderBy: { createdAt: "asc" }
  });

  const data = sanitizeStoreInput(input);

  if (!existingStore) {
    return await prisma.storeSetting.create({
      data
    });
  }

  return await prisma.storeSetting.update({
    where: { id: existingStore.id },
    data
  });
}

/**
 * Delete the store record (or reset it).
 */
export async function deleteStore() {
  const existingStore = await prisma.storeSetting.findFirst();
  if (!existingStore) {
    throw new AppError(MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "STORE_NOT_FOUND");
  }

  return await prisma.storeSetting.delete({
    where: { id: existingStore.id }
  });
}

function sanitizeStoreInput(input) {
  const data = {};

  const stringFields = [
    "storeName",
    "storeTagline",
    "description",
    "logoUrl",
    "darkLogoUrl",
    "faviconUrl",
    "email",
    "supportEmail",
    "phone",
    "whatsapp",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postalCode",
    "country",
    "taxId",
    "businessRegistration",
    "legalName",
    "instagramUrl",
    "facebookUrl",
    "twitterUrl",
    "linkedinUrl",
    "youtubeUrl",
    "maintenanceMessage",
    "announcementBarText",
    "defaultCurrency",
    "invoicePrefix",
    "invoiceFooterNote"
  ];

  for (const field of stringFields) {
    if (input[field] !== undefined) {
      data[field] = input[field] === null ? null : String(input[field]);
    }
  }

  if (input.isMaintenanceMode !== undefined) {
    data.isMaintenanceMode = Boolean(input.isMaintenanceMode);
  }

  if (input.isAnnouncementActive !== undefined) {
    data.isAnnouncementActive = Boolean(input.isAnnouncementActive);
  }

  if (input.lowStockThreshold !== undefined) {
    data.lowStockThreshold = Number.parseInt(input.lowStockThreshold, 10) || 0;
  }

  if (input.freeShippingThreshold !== undefined) {
    data.freeShippingThreshold = input.freeShippingThreshold === null ? null : Number(input.freeShippingThreshold);
  }

  if (input.standardShippingFee !== undefined) {
    data.standardShippingFee = input.standardShippingFee === null ? null : Number(input.standardShippingFee);
  }

  if (input.taxRatePercentage !== undefined) {
    data.taxRatePercentage = input.taxRatePercentage === null ? null : Number(input.taxRatePercentage);
  }

  if (input.metadata !== undefined) {
    data.metadata = input.metadata;
  }

  return data;
}
