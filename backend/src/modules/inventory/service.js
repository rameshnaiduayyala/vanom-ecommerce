import { InventoryRepository } from "./repository.js";

export class InventoryService {
  async getStock(variantId) {
    return InventoryRepository.getAvailableStock(variantId);
  }

  async adjustStock(params) {
    return InventoryRepository.adjustStock(params);
  }
}
