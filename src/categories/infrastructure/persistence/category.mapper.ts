import { Category } from '../../domain/category.entity';
import { CategoryOrmEntity } from './category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): Category {
    return new Category(
      orm.id,
      orm.name,
      orm.description,
      orm.parentId,
      orm.createdAt,
    );
  }

  static toOrm(domain: Category): CategoryOrmEntity {
    const entity = new CategoryOrmEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.parentId = domain.parentId;
    return entity;
  }
}
