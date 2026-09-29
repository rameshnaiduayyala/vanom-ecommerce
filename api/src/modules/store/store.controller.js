import * as storeService from "./store.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../common/errors/app-error.js";
import { replaceFile } from "../../common/utils/file-upload.js";

async function parseStoreInput(request, currentStore = null) {
  if (!request.isMultipart?.()) {
    return request.body || {};
  }

  const input = {};

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (["logo", "darkLogo", "favicon"].includes(part.fieldname)) {
        const fieldKey = part.fieldname === "logo" 
          ? "logoUrl" 
          : part.fieldname === "darkLogo" 
          ? "darkLogoUrl" 
          : "faviconUrl";

        const oldKey = currentStore ? currentStore[fieldKey] : null;
        const file = oldKey
          ? await replaceFile("store", part, oldKey)
          : await request.server.uploadFile("store", part);

        input[fieldKey] = file.storageKey;
      }
      continue;
    }

    if (part.fieldname === "data" || part.fieldname === "metadata") {
      try {
        if (part.fieldname === "data") {
          Object.assign(input, JSON.parse(part.value));
        } else {
          input.metadata = JSON.parse(part.value);
        }
      } catch {
        throw new AppError(`The ${part.fieldname} field must contain valid JSON`, HTTP_STATUS.BAD_REQUEST, "INVALID_JSON");
      }
      continue;
    }

    let value = part.value;
    if (part.fieldname === "isMaintenanceMode" || part.fieldname === "isAnnouncementActive") {
      value = part.value === "true" || part.value === true;
    }

    input[part.fieldname] = value;
  }

  return input;
}

/**
 * Get full store settings (Superadmin)
 */
export async function get(request, reply) {
  const store = await storeService.getStore(true);
  return sendSuccess(reply, {
    message: MESSAGES.STORE_FETCHED,
    data: store
  });
}

/**
 * Get public store settings (Storefront / Public)
 */
export async function getPublic(request, reply) {
  const store = await storeService.getStore(true);
  return sendSuccess(reply, {
    message: MESSAGES.STORE_FETCHED,
    data: {
      storeName: store.storeName,
      storeTagline: store.storeTagline,
      description: store.description,
      logoUrl: store.logoUrl,
      darkLogoUrl: store.darkLogoUrl,
      faviconUrl: store.faviconUrl,
      email: store.email,
      supportEmail: store.supportEmail,
      phone: store.phone,
      whatsapp: store.whatsapp,
      addressLine1: store.addressLine1,
      addressLine2: store.addressLine2,
      city: store.city,
      state: store.state,
      postalCode: store.postalCode,
      country: store.country,
      instagramUrl: store.instagramUrl,
      facebookUrl: store.facebookUrl,
      twitterUrl: store.twitterUrl,
      linkedinUrl: store.linkedinUrl,
      youtubeUrl: store.youtubeUrl,
      isMaintenanceMode: store.isMaintenanceMode,
      maintenanceMessage: store.maintenanceMessage,
      announcementBarText: store.announcementBarText,
      isAnnouncementActive: store.isAnnouncementActive,
      defaultCurrency: store.defaultCurrency,
      freeShippingThreshold: store.freeShippingThreshold,
      standardShippingFee: store.standardShippingFee,
      taxRatePercentage: store.taxRatePercentage
    }
  });
}

/**
 * Create store settings (Strictly Superadmin, only 1 allowed)
 */
export async function create(request, reply) {
  const input = await parseStoreInput(request);
  const store = await storeService.createStore(input);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.STORE_CREATED,
    data: store
  });
}

/**
 * Update store settings (Strictly Superadmin, single store)
 */
export async function update(request, reply) {
  const currentStore = await storeService.getStore();
  const input = await parseStoreInput(request, currentStore);
  const updatedStore = await storeService.updateStore(input);
  return sendSuccess(reply, {
    message: MESSAGES.STORE_UPDATED,
    data: updatedStore
  });
}

/**
 * Delete store settings (Strictly Superadmin)
 */
export async function remove(request, reply) {
  const deletedStore = await storeService.deleteStore();
  return sendSuccess(reply, {
    message: MESSAGES.STORE_DELETED,
    data: deletedStore
  });
}
