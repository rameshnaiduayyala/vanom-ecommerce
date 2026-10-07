import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./api";

export function useProducts() {
  return useQuery({
    queryKey: ["products", 1],
    queryFn: () => getProducts(1, 10),
  });
}
