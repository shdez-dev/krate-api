import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './persistence/order.orm-entity';
import { OrderItemOrmEntity } from './persistence/order-item.orm-entity';
import { TypeOrmOrderRepository } from './persistence/typeorm-order.repository';
import { OrderRepositoryPort } from '../domain/order.repository.port';
import { OrdersService } from '../application/orders.service';
import { OrdersController } from '../presentation/orders.controller';
import { CartModule } from '../../cart/infrastructure/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity]),
    CartModule,
  ],
  providers: [
    OrdersService,
    { provide: OrderRepositoryPort, useClass: TypeOrmOrderRepository },
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
