import { QuoteRepository } from "./repository.js";
import { GeographyRepository } from "../geography/repository.js";
import { OrderRepository } from "../orders/repository.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { TaxService } from "../tax/routes.js";
import { Money } from "../../common/utils/money.js";
import { IdGenerator } from "../../common/utils/id-generator.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class QuoteService {
  constructor(taxService = new TaxService()) {
    this.taxService = taxService;
  }

  async createQuote(user, { companyId, bulkOrderId, items = [], customerNotes, countryCode = "IN", currencyCode = "INR" }) {
    const member = user.companyMembers?.find(m => m.companyId === companyId);
    if (!member && !user.roles?.includes("ADMIN")) {
      throw new ForbiddenError("Only registered company members or administrators can request wholesale quotes");
    }

    const country = await GeographyRepository.getCountryByCode(countryCode);
    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);

    let subtotal = Money.toDecimal(0);
    const quoteItems = [];

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

      const itemSubtotal = Money.round(Money.multiply(priceResult.unitPrice, item.quantity), 2);
      subtotal = Money.add(subtotal, itemSubtotal);

      quoteItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: priceResult.unitPrice,
        subtotal: itemSubtotal,
        discount: Money.toDecimal(0),
        taxAmount: Money.toDecimal(0),
        totalAmount: itemSubtotal,
        packagingSnapshot: variant.packaging || [],
      });
    }

    const taxResult = await this.taxService.calculateTax({
      countryCode,
      items: quoteItems,
      customerType: "B2B",
      isB2BApproved: true,
    });

    const taxAmount = Money.toDecimal(taxResult.totalTax);
    const totalAmount = Money.add(subtotal, taxAmount);

    return QuoteRepository.createQuote({
      companyId,
      requestedById: user.id,
      bulkOrderId,
      countryId: country.id,
      currencyId: currency.id,
      subtotal,
      taxAmount,
      totalAmount,
      customerNotes,
      items: quoteItems,
    });
  }

  async getQuoteById(id, user) {
    const quote = await QuoteRepository.findById(id);
    if (!quote) throw new NotFoundError("Quote not found", ERROR_CODES.QUOTE_NOT_FOUND);

    const isMember = quote.company?.members?.some(m => m.userId === user.id);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("Access denied to this quote");
    }

    return quote;
  }

  async submitQuote(id, user) {
    const quote = await this.getQuoteById(id, user);
    return QuoteRepository.updateStatus(quote.id, "REQUESTED");
  }

  async createCounterQuoteVersion(quoteId, adminUser, { discount, shipping, customPrices = [], internalNotes }) {
    const quote = await this.getQuoteById(quoteId, adminUser);

    let subtotal = Money.toDecimal(0);
    const updatedItems = quote.items.map(item => {
      const override = customPrices.find(cp => cp.variantId === item.variantId);
      const unitPrice = override ? Money.toDecimal(override.unitPrice) : item.unitPrice;
      const itemSubtotal = Money.round(Money.multiply(unitPrice, item.quantity), 2);
      subtotal = Money.add(subtotal, itemSubtotal);
      return {
        ...item,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const discountAmount = discount ? Money.toDecimal(discount) : Money.toDecimal(0);
    const shippingAmount = shipping ? Money.toDecimal(shipping) : Money.toDecimal(0);

    const taxResult = await this.taxService.calculateTax({
      countryCode: quote.country.code,
      items: updatedItems,
      customerType: "B2B",
      isB2BApproved: true,
    });

    const taxAmount = Money.toDecimal(taxResult.totalTax);
    const totalAmount = Money.round(
      Money.add(Money.subtract(subtotal, discountAmount), Money.add(shippingAmount, taxAmount)),
      2
    );

    return QuoteRepository.createNewVersion(quote.id, {
      subtotal,
      discount: discountAmount,
      shipping: shippingAmount,
      tax: taxAmount,
      total: totalAmount,
      snapshot: {
        updatedBy: adminUser.id,
        items: updatedItems,
        internalNotes,
        calculatedAt: new Date().toISOString(),
      },
      newStatus: "QUOTED",
    });
  }

  async acceptQuote(id, user) {
    const quote = await this.getQuoteById(id, user);
    if (quote.status !== "QUOTED") {
      throw new BusinessRuleError("Only reviewed quotes in QUOTED status can be accepted");
    }
    return QuoteRepository.updateStatus(quote.id, "CUSTOMER_ACCEPTED");
  }

  async convertToOrder(id, user, { billingAddress, shippingAddress }) {
    const quote = await this.getQuoteById(id, user);

    if (quote.status !== "CUSTOMER_ACCEPTED") {
      throw new BusinessRuleError("Quote must be in CUSTOMER_ACCEPTED status to convert to an order", ERROR_CODES.QUOTE_NOT_ACCEPTED);
    }

    const orderNumber = IdGenerator.generateOrderNumber();

    const order = await prisma.$transaction(async tx => {
      const createdOrder = await OrderRepository.createOrderWithTransaction(
        {
          orderData: {
            orderNumber,
            userId: quote.requestedById,
            companyId: quote.companyId,
            customerType: "B2B",
            source: "B2B_PORTAL",
            status: "PENDING_PAYMENT",
            countryId: quote.countryId,
            currencyId: quote.currencyId,
            subtotal: quote.subtotal,
            discountAmount: quote.discountAmount,
            shippingAmount: quote.shippingAmount,
            taxAmount: quote.taxAmount,
            totalAmount: quote.totalAmount,
            billingAddress: billingAddress || {},
            shippingAddress: shippingAddress || {},
            customerSnapshot: {
              quoteId: quote.id,
              quoteNumber: quote.quoteNumber,
              companyId: quote.companyId,
            },
            notes: `Converted from Quote ${quote.quoteNumber}`,
            placedAt: new Date(),
          },
          itemsData: quote.items.map(item => ({
            variantId: item.variantId,
            skuSnapshot: item.variant.sku,
            productNameSnapshot: item.variant.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            discountAmount: item.discount,
            taxAmount: item.taxAmount,
            totalAmount: item.totalAmount,
            currencyId: quote.currencyId,
            packagingSnapshot: item.packagingSnapshot,
          })),
          reservationsData: [],
          taxCalculationData: {
            provider: "QUOTE_PRESET",
            totalTax: quote.taxAmount,
            taxLines: [],
          },
          outboxEventData: {
            eventType: "QUOTE_CONVERTED_TO_ORDER",
          },
        },
        tx
      );

      await tx.quote.update({
        where: { id: quote.id },
        data: { status: "CONVERTED" },
      });

      return createdOrder;
    });

    return order;
  }
}
