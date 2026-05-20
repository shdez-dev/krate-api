import { Order } from './order.entity';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';

export abstract class OrderRepositoryPort {
  abstract findById(id: string): Promise<Order | null>;
  abstract findByUserId(userId: string): Promise<Order[]>;
  abstract findAll(): Promise<Order[]>;
  abstract save(order: Order): Promise<Order>;
  abstract updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
