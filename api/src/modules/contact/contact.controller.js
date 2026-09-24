import * as contactService from "./contact.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";

/**
 * Submit contact message (Public)
 */
export async function submitContact(request, reply) {
  const ipAddress = request.ip || request.headers["x-forwarded-for"] || null;
  const message = await contactService.createContactMessage(request.body || {}, ipAddress);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Thank you for contacting us! Our support team will get back to you shortly.",
    data: {
      id: message.id,
      name: message.name,
      email: message.email,
      createdAt: message.createdAt
    }
  });
}

/**
 * List contact messages (Superadmin)
 */
export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await contactService.listContactMessages({
    page: pagination.page,
    limit: pagination.limit,
    status: request.query.status,
    search: request.query.search
  });

  return sendSuccess(reply, {
    message: "Contact messages fetched successfully",
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

/**
 * Update message status (Superadmin)
 */
export async function update(request, reply) {
  const updated = await contactService.updateContactMessage(request.params.id, request.body || {});
  return sendSuccess(reply, {
    message: "Contact message updated successfully",
    data: updated
  });
}

/**
 * Delete message (Superadmin)
 */
export async function remove(request, reply) {
  const deleted = await contactService.deleteContactMessage(request.params.id);
  return sendSuccess(reply, {
    message: "Contact message deleted successfully",
    data: deleted
  });
}
