import { api } from "../../lib/api";
import { Category } from "./products.api";

export type { Category };

export const categoriesApi = {
  getCategories: () =>
    api.get<{ success: boolean; data: Category[] }>("/categories"),

  getCategoryById: (id: string) =>
    api.get<{ success: boolean; data: Category }>(`/categories/${id}`),
};
