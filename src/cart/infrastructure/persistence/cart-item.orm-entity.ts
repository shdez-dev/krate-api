import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CartOrmEntity } from './cart.orm-entity';
import { ProductOrmEntity } from '../../../products/infrastructure/persistence/product.orm-entity';

@Entity('cart_items')
export class CartItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => CartOrmEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartOrmEntity;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductOrmEntity;

  @Column({ default: 1 })
  quantity: number;
}
