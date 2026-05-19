import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Product } from '../domain/product.entity';
import { ProductRepositoryPort, ProductFilters, PaginatedProducts } from '../domain/product.repository.port';
import { CategoriesService } from '../../categories/application/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepositoryPort,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(filters: ProductFilters): Promise<PaginatedProducts> {
    return this.productRepo.findAll(filters);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product || !product.isActive) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.categoriesService.findById(dto.categoryId);

    if (dto.price < 0) throw new BadRequestException('El precio no puede ser negativo');
    if (dto.stock !== undefined && dto.stock < 0) throw new BadRequestException('El stock no puede ser negativo');

    const product = new Product(
      uuid(),
      dto.name,
      dto.description ?? null,
      dto.price,
      dto.stock ?? 0,
      dto.imageUrl ?? null,
      dto.categoryId,
      null,
      new Date(),
    );
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findById(id);

    if (dto.categoryId) await this.categoriesService.findById(dto.categoryId);
    if (dto.price !== undefined && dto.price < 0) throw new BadRequestException('El precio no puede ser negativo');
    if (dto.stock !== undefined && dto.stock < 0) throw new BadRequestException('El stock no puede ser negativo');

    return this.productRepo.update(id, dto);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.productRepo.softDelete(id);
  }
}
