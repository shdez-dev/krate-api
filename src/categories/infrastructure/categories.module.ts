import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryOrmEntity } from './persistence/category.orm-entity';
import { TypeOrmCategoryRepository } from './persistence/typeorm-category.repository';
import { CategoryRepositoryPort } from '../domain/category.repository.port';
import { CategoriesService } from '../application/categories.service';
import { CategoriesController } from '../presentation/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  providers: [
    CategoriesService,
    { provide: CategoryRepositoryPort, useClass: TypeOrmCategoryRepository },
  ],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
