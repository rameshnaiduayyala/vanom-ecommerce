import { api } from "../../lib/api";




export const categoriesApi = {
  getCategories: () =>
  api.get("/categories"),

  getCategoryById: (id) =>
  api.get(`/categories/${id}`)
};