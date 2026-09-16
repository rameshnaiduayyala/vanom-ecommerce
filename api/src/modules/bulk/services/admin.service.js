import * as bulk from "../service.js";
export const listBusinesses = bulk.listBusinesses;
export const getBusiness = bulk.getBusiness;
export const approveBusiness = (id, adminId) => bulk.changeBusinessStatus(id, "APPROVED", adminId);
export const rejectBusiness = (id, adminId, reason) => bulk.changeBusinessStatus(id, "REJECTED", adminId, reason);
export const suspendBusiness = (id, adminId) => bulk.changeBusinessStatus(id, "SUSPENDED", adminId);
export const listOrders = (adminId, query) => bulk.listOrders(adminId, query, true);
export const getOrder = (adminId, id) => bulk.getOrder(adminId, id, true);
export const updateOrderStatus = bulk.updateOrderStatus;
