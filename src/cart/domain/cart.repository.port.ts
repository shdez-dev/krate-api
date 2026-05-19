import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';

export abstract class CartRepositoryPort {
  abstract findByUserId(userId: string): Promise<Cart | null>;
  abstract findOrCreateByUserId(userId: string): Promise<Cart>;
  abstract findItemById(itemId: string): Promise<CartItem | null>;
  abstract addItem(cartId: string, productId: string, quantity: number): Promise<CartItem>;
  abstract updateItemQuantity(itemId: string, quantity: number): Promise<CartItem>;
  abstract removeItem(itemId: string): Promise<void>;
  abstract clearCart(cartId: string): Promise<void>;
}
