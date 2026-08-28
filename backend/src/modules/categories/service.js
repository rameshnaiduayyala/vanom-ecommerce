import { CategoryRepository } from "./repository.js";

export class CategoryService {
  async list() {
    return CategoryRepository.listCategories();
  }

  async getById(id) {
    return CategoryRepository.getById(id);
  }

  async create(data) {
    return CategoryRepository.create(data);
  }
}
