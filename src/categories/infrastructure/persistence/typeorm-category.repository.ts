import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../domain/category.entity';
import { CategoryRepositoryPort } from '../../domain/category.repository.port';
import { CategoryOrmEntity } from './category.orm-entity';
import { CategoryMapper } from './category.mapper';

@Injectable()
export class TypeOrmCategoryRepository implements CategoryRepositoryPort {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    const results = await this.repo.find();
    return results.map(CategoryMapper.toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async save(category: Category): Promise<Category> {
    const orm = CategoryMapper.toOrm(category);
    const saved = await this.repo.save(orm);
    return CategoryMapper.toDomain(saved);
  }

  async update(
    id: string,
    data: Partial<Pick<Category, 'name' | 'description' | 'parentId'>>,
  ): Promise<Category> {
    await this.repo.update(id, data);
    const orm = await this.repo.findOneOrFail({ where: { id } });
    return CategoryMapper.toDomain(orm);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }
}
