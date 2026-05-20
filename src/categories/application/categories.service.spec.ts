import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryRepositoryPort } from '../domain/category.repository.port';
import { Category } from '../domain/category.entity';

const mockCategory = new Category(
  'uuid-1',
  'Electrónica',
  null,
  null,
  new Date(),
);

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: jest.Mocked<CategoryRepositoryPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoryRepositoryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CategoriesService);
    categoryRepo = module.get(CategoryRepositoryPort);
  });

  describe('findAll', () => {
    it('retorna todas las categorías', async () => {
      categoryRepo.findAll.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('retorna la categoría si existe', async () => {
      categoryRepo.findById.mockResolvedValue(mockCategory);
      const result = await service.findById('uuid-1');
      expect(result).toBe(mockCategory);
    });

    it('lanza NotFoundException si no existe', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(service.findById('uuid-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('crea una categoría sin padre', async () => {
      categoryRepo.save.mockResolvedValue(mockCategory);
      const result = await service.create({ name: 'Electrónica' });
      expect(result).toBe(mockCategory);
    });

    it('lanza BadRequestException si el padre no existe', async () => {
      categoryRepo.exists.mockResolvedValue(false);
      await expect(
        service.create({ name: 'Sub', parentId: 'uuid-x' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('crea una categoría con padre válido', async () => {
      categoryRepo.exists.mockResolvedValue(true);
      const child = new Category('uuid-2', 'Sub', null, 'uuid-1', new Date());
      categoryRepo.save.mockResolvedValue(child);

      const result = await service.create({ name: 'Sub', parentId: 'uuid-1' });
      expect(result.parentId).toBe('uuid-1');
    });
  });

  describe('update', () => {
    it('actualiza correctamente', async () => {
      categoryRepo.findById.mockResolvedValue(mockCategory);
      const updated = new Category('uuid-1', 'Updated', null, null, new Date());
      categoryRepo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('lanza NotFoundException si no existe', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(service.update('uuid-x', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza BadRequestException si se asigna como su propio padre', async () => {
      categoryRepo.findById.mockResolvedValue(mockCategory);
      await expect(
        service.update('uuid-1', { parentId: 'uuid-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('elimina correctamente', async () => {
      categoryRepo.findById.mockResolvedValue(mockCategory);
      categoryRepo.delete.mockResolvedValue();
      await service.delete('uuid-1');
      expect(categoryRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('lanza NotFoundException si no existe', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(service.delete('uuid-x')).rejects.toThrow(NotFoundException);
    });
  });
});
