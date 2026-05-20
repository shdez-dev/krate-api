import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import {
  ProductRepositoryPort,
  ProductFilters,
  PaginatedProducts,
} from '../../domain/product.repository.port';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(filters: ProductFilters): Promise<PaginatedProducts> {
    const where: Record<string, unknown> = { deletedAt: IsNull() };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.name) where.name = Like(`%${filters.name}%`);

    const qb = this.repo
      .createQueryBuilder('product')
      .where('product.deleted_at IS NULL');

    if (filters.categoryId)
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.name)
      qb.andWhere('product.name LIKE :name', { name: `%${filters.name}%` });
    if (filters.minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    if (filters.maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });

    const total = await qb.getCount();

    qb.skip(filters.offset ?? 0).take(filters.limit ?? 10);

    const results = await qb.getMany();
    return { data: results.map((p) => ProductMapper.toDomain(p)), total };
  }

  async findById(id: string): Promise<Product | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async save(product: Product): Promise<Product> {
    const orm = ProductMapper.toOrm(product);
    const saved = await this.repo.save(orm);
    return ProductMapper.toDomain(saved);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        Product,
        'name' | 'description' | 'price' | 'stock' | 'imageUrl' | 'categoryId'
      >
    >,
  ): Promise<Product> {
    await this.repo.update(id, data);
    const orm = await this.repo.findOneOrFail({ where: { id } });
    return ProductMapper.toDomain(orm);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { deletedAt: new Date() });
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id, deletedAt: IsNull() });
  }
}
