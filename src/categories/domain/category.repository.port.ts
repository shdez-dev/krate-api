import { Category } from './category.entity';

export abstract class CategoryRepositoryPort {
  abstract findAll(): Promise<Category[]>;
  abstract findById(id: string): Promise<Category | null>;
  abstract save(category: Category): Promise<Category>;
  abstract update(id: string, data: Partial<Pick<Category, 'name' | 'description' | 'parentId'>>): Promise<Category>;
  abstract delete(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
}
