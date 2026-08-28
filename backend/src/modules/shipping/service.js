import { ShippingRepository } from "./repository.js";
import { NotFoundError, ForbiddenError } from "../../common/errors/index.js";

export class ShippingService {
  async getShipmentById(id, user) {
    const shipment = await ShippingRepository.findById(id);
    if (!shipment) throw new NotFoundError("Shipment not found");

    const isOwner = shipment.order?.userId === user.id;
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Access denied to shipment");
    }

    return shipment;
  }

  async getTracking(id, user) {
    const shipment = await this.getShipmentById(id, user);
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      carrier: shipment.carrier?.name || "Standard Carrier",
      fulfillmentType: shipment.fulfillmentType,
      events: shipment.events,
    };
  }

  async listShipments(user, params) {
    return ShippingRepository.list(params);
  }
}
