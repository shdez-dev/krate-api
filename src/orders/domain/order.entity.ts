import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';
import { OrderItem } from './order-item.entity';

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: OrderStatus,
    public readonly total: number,
    public readonly shippingAddress: ShippingAddress,
    public readonly items: OrderItem[],
    public readonly createdAt: Date,
  ) {}
}
