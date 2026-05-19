import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Cart } from '../../domain/cart.entity';
import { CartItem } from '../../domain/cart-item.entity';
import { CartRepositoryPort } from '../../domain/cart.repository.port';
import { CartOrmEntity } from './cart.orm-entity';
import { CartItemOrmEntity } from './cart-item.orm-entity';
import { CartMapper } from './cart.mapper';

@Injectable()
export class TypeOrmCartRepository implements CartRepositoryPort {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly cartRepo: Repository<CartOrmEntity>,
    @InjectRepository(CartItemOrmEntity)
    private readonly itemRepo: Repository<CartItemOrmEntity>,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const orm = await this.cartRepo.findOne({ where: { userId } });
    return orm ? CartMapper.toDomain(orm) : null;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let orm = await this.cartRepo.findOne({ where: { userId } });
    if (!orm) {
      orm = await this.cartRepo.save(
        this.cartRepo.create({ id: uuid(), userId }),
      );
    }
    return CartMapper.toDomain(orm);
  }

  async findItemById(itemId: string): Promise<CartItem | null> {
    const orm = await this.itemRepo.findOne({ where: { id: itemId } });
    return orm ? CartMapper.itemToDomain(orm) : null;
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    const existing = await this.itemRepo.findOne({ where: { cartId, productId } });
    if (existing) {
      existing.quantity += quantity;
      const saved = await this.itemRepo.save(existing);
      return CartMapper.itemToDomain(saved);
    }

    const item = this.itemRepo.create({ id: uuid(), cartId, productId, quantity });
    const saved = await this.itemRepo.save(item);
    return CartMapper.itemToDomain(saved);
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    await this.itemRepo.update(itemId, { quantity });
    const orm = await this.itemRepo.findOneOrFail({ where: { id: itemId } });
    return CartMapper.itemToDomain(orm);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.itemRepo.delete(itemId);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.itemRepo.delete({ cartId });
  }
}
