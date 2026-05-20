import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderStatus } from '../../../shared/domain/value-objects/order-status.enum';
import { OrderItemOrmEntity } from './order-item.orm-entity';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'shipping_address', type: 'json' })
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
