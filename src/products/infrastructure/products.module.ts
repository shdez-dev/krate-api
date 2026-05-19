import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrmEntity } from './persistence/product.orm-entity';
import { TypeOrmProductRepository } from './persistence/typeorm-product.repository';
import { ProductRepositoryPort } from '../domain/product.repository.port';
import { ProductsService } from '../application/products.service';
import { ProductsController } from '../presentation/products.controller';
import { CategoriesModule } from '../../categories/infrastructure/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity]), CategoriesModule],
  providers: [
    ProductsService,
    { provide: ProductRepositoryPort, useClass: TypeOrmProductRepository },
  ],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
