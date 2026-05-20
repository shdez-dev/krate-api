import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductRepositoryPort } from '../domain/product.repository.port';
import { CategoriesService } from '../../categories/application/categories.service';
import { Product } from '../domain/product.entity';
import { Category } from '../../categories/domain/category.entity';

const mockCategory = new Category('cat-1', 'Electrónica', null, null, new Date());

const mockProduct = new Product(
  'prod-1',
  'Laptop',
  'Descripción',
  999.99,
  10,
  null,
  'cat-1',
  null,
  new Date(),
);

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: jest.Mocked<ProductRepositoryPort>;
  let categoriesService: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepositoryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    productRepo = module.get(ProductRepositoryPort);
    categoriesService = module.get(CategoriesService);
  });

  describe('findAll', () => {
    it('retorna lista paginada', async () => {
      productRepo.findAll.mockResolvedValue({ data: [mockProduct], total: 1 });
      const result = await service.findAll({});
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('retorna el producto si existe y está activo', async () => {
      productRepo.findById.mockResolvedValue(mockProduct);
      const result = await service.findById('prod-1');
      expect(result).toBe(mockProduct);
    });

    it('lanza NotFoundException si no existe', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.findById('prod-x')).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si el producto está eliminado', async () => {
      const deleted = new Product('prod-1', 'Laptop', null, 999, 0, null, 'cat-1', new Date(), new Date());
      productRepo.findById.mockResolvedValue(deleted);
      await expect(service.findById('prod-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'Laptop',
      price: 999.99,
      categoryId: 'cat-1',
    };

    it('crea el producto correctamente', async () => {
      categoriesService.findById.mockResolvedValue(mockCategory);
      productRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create(dto);
      expect(result).toBe(mockProduct);
    });

    it('lanza BadRequestException con precio negativo', async () => {
      categoriesService.findById.mockResolvedValue(mockCategory);
      await expect(service.create({ ...dto, price: -1 })).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException con stock negativo', async () => {
      categoriesService.findById.mockResolvedValue(mockCategory);
      await expect(service.create({ ...dto, stock: -1 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('actualiza correctamente', async () => {
      productRepo.findById.mockResolvedValue(mockProduct);
      const updated = { ...mockProduct, name: 'Laptop Pro' } as Product;
      productRepo.update.mockResolvedValue(updated);

      const result = await service.update('prod-1', { name: 'Laptop Pro' });
      expect(result.name).toBe('Laptop Pro');
    });

    it('lanza NotFoundException si no existe', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.update('prod-x', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('hace soft delete correctamente', async () => {
      productRepo.findById.mockResolvedValue(mockProduct);
      productRepo.softDelete.mockResolvedValue();

      await service.softDelete('prod-1');
      expect(productRepo.softDelete).toHaveBeenCalledWith('prod-1');
    });

    it('lanza NotFoundException si no existe', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.softDelete('prod-x')).rejects.toThrow(NotFoundException);
    });
  });
});
