import { prisma } from "../../infrastructure/database/prisma.js";
import { BulkOrderRepository } from "./repository.js";
import { GeographyRepository } from "../geography/repository.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { Money } from "../../common/utils/money.js";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/index.js";

export class BulkOrderService {
  async createBulkOrder(user, { companyId, items = [], notes, countryCode = "IN", currencyCode = "INR" }) {
    const member = user.companyMembers?.find(m => m.companyId === companyId);
    if (!member && !user.roles?.includes("ADMIN")) {
      throw new ForbiddenError("You must be an authorized member of the company");
    }

    if (!items || items.length === 0) {
      throw new BusinessRuleError("At least one bulk item is required");
    }

    const country = await GeographyRepository.getCountryByCode(countryCode);
    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);

    const validatedItems = [];
    let subtotal = Money.toDecimal(0);

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true, packaging: true },
      });

      if (!variant) throw new NotFoundError(`Variant ${item.variantId} not found`);

      const priceResult = await PriceResolver.resolvePrice({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        countryCode,
        currencyCode,
        user,
        companyId,
      });

      const itemSubtotal = Money.multiply(priceResult.unitPrice, item.quantity);
      subtotal = Money.add(subtotal, itemSubtotal);

      validatedItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: priceResult.unitPrice,
        subtotal: itemSubtotal,
        packagingSnapshot: variant.packaging || [],
        requestedDeliveryDate: item.requestedDeliveryDate,
      });
    }

    return BulkOrderRepository.create({
      companyId,
      requestedById: user.id,
      countryId: country.id,
      currencyId: currency.id,
      notes,
      items: validatedItems,
    });
  }

  async getBulkOrderById(id, user) {
    const order = await BulkOrderRepository.findById(id);
    if (!order) throw new NotFoundError("Bulk order inquiry not found");

    const isMember = order.company?.members?.some(m => m.userId === user.id);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("Access denied to this bulk order");
    }

    return order;
  }

  async submitBulkOrder(id, user) {
    const order = await this.getBulkOrderById(id, user);
    return BulkOrderRepository.updateStatus(order.id, "SUBMITTED");
  }

  async listBulkOrders(user, params) {
    return BulkOrderRepository.list(params);
  }
}
