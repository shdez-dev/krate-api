import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product(
      orm.id,
      orm.name,
      orm.description,
      Number(orm.price),
      orm.stock,
      orm.imageUrl,
      orm.categoryId,
      orm.deletedAt,
      orm.createdAt,
    );
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const entity = new ProductOrmEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price;
    entity.stock = domain.stock;
    entity.imageUrl = domain.imageUrl;
    entity.categoryId = domain.categoryId;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
