import { api } from "@/lib/api";
import type { ProductResponse } from "./types";

export async function getProducts(page = 1, pageSize = 10) {
  return api.get<ProductResponse>(
    `/products?page=${page}&pageSize=${pageSize}`
  );
}
