import { OrderRepository } from "./repository.js";
import { CheckoutService } from "../checkout/service.js";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class OrderService {
  constructor(checkoutService = new CheckoutService()) {
    this.checkoutService = checkoutService;
  }

  async createOrder(user, payload, idempotencyKey = null) {
    return this.checkoutService.placeOrder(user, payload, idempotencyKey);
  }

  async getOrderById(orderId, user) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found", ERROR_CODES.ORDER_NOT_FOUND);
    }

    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");
    const isOwner = order.userId === user.id;
    const isCompanyMember = order.companyId && user.companyMembers?.some(m => m.companyId === order.companyId);

    if (!isAdmin && !isOwner && !isCompanyMember) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    return order;
  }

  async listUserOrders(user, params) {
    return OrderRepository.listUserOrders(user.id, params);
  }

  async listCompanyOrders(companyId, user, params) {
    const isMember = user.companyMembers?.some(m => m.companyId === companyId);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have access to this company's orders");
    }

    return OrderRepository.listCompanyOrders(companyId, params);
  }

  async cancelOrder(orderId, user, reason) {
    const order = await this.getOrderById(orderId, user);

    if (order.status !== "PENDING_PAYMENT" && order.status !== "DRAFT" && order.status !== "PAID") {
      throw new BusinessRuleError(
        `Order in status '${order.status}' cannot be cancelled`,
        ERROR_CODES.ORDER_CANNOT_BE_CANCELLED
      );
    }

    return OrderRepository.cancelOrder(orderId, user.id, reason);
  }
}
