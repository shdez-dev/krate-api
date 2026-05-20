import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItemOrmEntity } from './cart-item.orm-entity';

@Entity('carts')
export class CartOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToMany(() => CartItemOrmEntity, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
