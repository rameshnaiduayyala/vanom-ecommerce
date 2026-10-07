export type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  category?: string;
  rating?: number;
};

export type ProductResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};
