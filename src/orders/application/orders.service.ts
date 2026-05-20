import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { DataSource } from 'typeorm';
import { Order } from '../domain/order.entity';
import { OrderItem } from '../domain/order-item.entity';
import { OrderRepositoryPort } from '../domain/order.repository.port';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';
import { CartRepositoryPort } from '../../cart/domain/cart.repository.port';
import { ProductOrmEntity } from '../../products/infrastructure/persistence/product.orm-entity';
import { OrderOrmEntity } from '../infrastructure/persistence/order.orm-entity';
import { OrderItemOrmEntity } from '../infrastructure/persistence/order-item.orm-entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepositoryPort,
    private readonly cartRepo: CartRepositoryPort,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string, userId: string, role: UserRole): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Sin acceso a esta orden');
    }
    return order;
  }

  findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId);
  }

  findAll(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const orderId = uuid();
    let total = 0;
    const orderItems: OrderItem[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (const cartItem of cart.items) {
        const product = await manager.findOne(ProductOrmEntity, {
          where: { id: cartItem.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || product.deletedAt) {
          throw new BadRequestException(
            `Producto no disponible: ${cartItem.productId}`,
          );
        }
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para: ${product.name}`,
          );
        }

        product.stock -= cartItem.quantity;
        await manager.save(ProductOrmEntity, product);

        const itemPrice = Number(product.price);
        total += itemPrice * cartItem.quantity;

        const item = manager.create(OrderItemOrmEntity, {
          id: uuid(),
          orderId,
          productId: product.id,
          productName: product.name,
          unitPrice: itemPrice,
          quantity: cartItem.quantity,
        });
        orderItems.push(
          new OrderItem(
            item.id,
            orderId,
            product.id,
            product.name,
            itemPrice,
            cartItem.quantity,
          ),
        );
        await manager.save(OrderItemOrmEntity, item);
      }

      const orderOrm = manager.create(OrderOrmEntity, {
        id: orderId,
        userId,
        status: OrderStatus.PENDING,
        total,
        shippingAddress: dto.shippingAddress,
      });
      await manager.save(OrderOrmEntity, orderOrm);
    });

    await this.cartRepo.clearCart(cart.id);

    return new Order(
      orderId,
      userId,
      OrderStatus.PENDING,
      total,
      dto.shippingAddress,
      orderItems,
      new Date(),
    );
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    return this.orderRepo.updateStatus(id, status);
  }
}
