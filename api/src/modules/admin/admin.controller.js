import * as adminService from "./admin.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function getMetrics(request, reply) {
  const timeRange = request.query?.timeRange || "30d";
  const data = await adminService.getDashboardMetrics(timeRange);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Admin metrics fetched successfully",
    data
  });
}

export async function getReports(request, reply) {
  const data = await adminService.getReports();
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Admin reports fetched successfully",
    data
  });
}

export async function getAuditLogs(request, reply) {
  const data = await adminService.getAuditLogs();
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Audit logs fetched successfully",
    data
  });
}

export async function getPayments(request, reply) {
  const data = await adminService.getPayments();
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Payments fetched successfully",
    data
  });
}

export async function getInventory(request, reply) {
  const data = await adminService.getInventory();
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Inventory fetched successfully",
    data
  });
}

export async function getQuotes(request, reply) {
  const data = await adminService.getAdminQuotes();
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.OK,
    message: "Quotes fetched successfully",
    data
  });
}
