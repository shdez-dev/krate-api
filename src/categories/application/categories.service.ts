import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Category } from '../domain/category.entity';
import { CategoryRepositoryPort } from '../domain/category.repository.port';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoryRepositoryPort) {}

  findAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      const parentExists = await this.categoryRepo.exists(dto.parentId);
      if (!parentExists) throw new BadRequestException('La categoría padre no existe');
    }

    const category = new Category(
      uuid(),
      dto.name,
      dto.description ?? null,
      dto.parentId ?? null,
      new Date(),
    );
    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Una categoría no puede ser su propio padre');
      const parentExists = await this.categoryRepo.exists(dto.parentId);
      if (!parentExists) throw new BadRequestException('La categoría padre no existe');
    }

    return this.categoryRepo.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.categoryRepo.delete(id);
  }
}
