import { api } from "../../lib/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  sortOrder?: number;
  productCount?: number;
  children?: Category[];
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  categories?: Array<{
    categoryId: string;
    category?: {
      name: string;
      slug: string;
    };
  }>;
  images?: Array<{
    id?: string;
    file?: {
      url: string;
    };
    url?: string;
  }>;
  resolvedPrice?: {
    unitPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    currency: string;
    symbol: string;
    tier?: string;
  };
  price?: number;
  variants?: Array<{
    id: string;
    sku?: string;
    name: string;
    weight?: number;
    price?: number;
  }>;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    items: Product[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const productsApi = {
  getProducts: (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isFeatured?: boolean;
    isBestSeller?: boolean;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
    if (params.isBestSeller !== undefined) query.append("isBestSeller", String(params.isBestSeller));
    
    const qs = query.toString();
    return api.get<ProductsResponse>(`/products${qs ? `?${qs}` : ""}`);
  },

  getFeatured: (limit = 8) =>
    api.get<{ success: boolean; data: Product[] }>(`/products/featured?limit=${limit}`),

  getBestSellers: (limit = 8) =>
    api.get<{ success: boolean; data: Product[] }>(`/products/best-sellers?limit=${limit}`),

  getProductByIdOrSlug: (idOrSlug: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${idOrSlug}`),
};
