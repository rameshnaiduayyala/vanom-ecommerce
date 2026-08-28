import { BrandRepository } from "./repository.js";

export class BrandService {
  async list() {
    return BrandRepository.listBrands();
  }

  async getById(id) {
    return BrandRepository.getById(id);
  }

  async create(data) {
    return BrandRepository.create(data);
  }
}
