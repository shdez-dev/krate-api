import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartOrmEntity } from './persistence/cart.orm-entity';
import { CartItemOrmEntity } from './persistence/cart-item.orm-entity';
import { TypeOrmCartRepository } from './persistence/typeorm-cart.repository';
import { CartRepositoryPort } from '../domain/cart.repository.port';
import { CartService } from '../application/cart.service';
import { CartController } from '../presentation/cart.controller';
import { ProductsModule } from '../../products/infrastructure/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartOrmEntity, CartItemOrmEntity]),
    ProductsModule,
  ],
  providers: [
    CartService,
    { provide: CartRepositoryPort, useClass: TypeOrmCartRepository },
  ],
  controllers: [CartController],
  exports: [CartService, CartRepositoryPort],
})
export class CartModule {}
