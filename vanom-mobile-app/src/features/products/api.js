import { api } from "@/lib/api";


export async function getProducts(page = 1, pageSize = 10) {
  return api.get(
    `/products?page=${page}&pageSize=${pageSize}`
  );
}