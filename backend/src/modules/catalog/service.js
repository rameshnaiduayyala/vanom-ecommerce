import { CatalogRepository } from "./repository.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { NotFoundError } from "../../common/errors/index.js";

export class CatalogService {
  async listProducts(params) {
    return CatalogRepository.listProducts(params);
  }

  async getProductById(id, context = {}) {
    const product = await CatalogRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product '${id}' not found`);
    }

    // Attach real-time contextual price preview if countryCode is available
    let pricePreview = null;
    try {
      pricePreview = await PriceResolver.resolvePrice({
        productId: product.id,
        quantity: 1,
        countryCode: context.countryCode || "IN",
        currencyCode: context.currencyCode || "INR",
        user: context.user || null,
      });
    } catch (e) {
      // Non-blocking if price resolution fails for preview
    }

    return {
      ...product,
      resolvedPrice: pricePreview,
    };
  }

  async createProduct(data) {
    return CatalogRepository.createProduct(data);
  }

  async updateProduct(id, data) {
    return CatalogRepository.updateProduct(id, data);
  }

  async deleteProduct(id) {
    return CatalogRepository.deleteProduct(id);
  }
}
