import { Cart } from '../../domain/cart.entity';
import { CartItem } from '../../domain/cart-item.entity';
import { CartOrmEntity } from './cart.orm-entity';
import { CartItemOrmEntity } from './cart-item.orm-entity';

export class CartMapper {
  static toDomain(orm: CartOrmEntity): Cart {
    const items = (orm.items ?? []).map(CartMapper.itemToDomain);
    return new Cart(orm.id, orm.userId, items, orm.createdAt);
  }

  static itemToDomain(orm: CartItemOrmEntity): CartItem {
    return new CartItem(orm.id, orm.cartId, orm.productId, orm.quantity);
  }
}
