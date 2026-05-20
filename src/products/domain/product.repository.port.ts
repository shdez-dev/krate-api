import { Product } from './product.entity';

export interface ProductFilters {
  categoryId?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
}

export abstract class ProductRepositoryPort {
  abstract findAll(filters: ProductFilters): Promise<PaginatedProducts>;
  abstract findById(id: string): Promise<Product | null>;
  abstract save(product: Product): Promise<Product>;
  abstract update(
    id: string,
    data: Partial<
      Pick<
        Product,
        'name' | 'description' | 'price' | 'stock' | 'imageUrl' | 'categoryId'
      >
    >,
  ): Promise<Product>;
  abstract softDelete(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
}
