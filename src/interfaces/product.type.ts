export interface ProductDTO {
  name: string;
  description: string;
  basePrice: number;
  categoryId: number;
}

export interface IProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string; // ID Kategori
}