import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Cart } from '../domain/cart.entity';
import { CartItem } from '../domain/cart-item.entity';
import { CartRepositoryPort } from '../domain/cart.repository.port';
import { ProductsService } from '../../products/application/products.service';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepositoryPort,
    private readonly productsService: ProductsService,
  ) {}

  getCart(userId: string): Promise<Cart> {
    return this.cartRepo.findOrCreateByUserId(userId);
  }

  async addItem(userId: string, dto: AddItemDto): Promise<CartItem> {
    const product = await this.productsService.findById(dto.productId);
    if (dto.quantity < 1)
      throw new BadRequestException('La cantidad debe ser al menos 1');
    if (product.stock < dto.quantity)
      throw new BadRequestException('Stock insuficiente');

    const cart = await this.cartRepo.findOrCreateByUserId(userId);
    return this.cartRepo.addItem(cart.id, dto.productId, dto.quantity);
  }

  async updateItem(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem> {
    if (quantity < 1)
      throw new BadRequestException('La cantidad debe ser al menos 1');

    const item = await this.cartRepo.findItemById(itemId);
    if (!item) throw new NotFoundException('Ítem no encontrado');

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || item.cartId !== cart.id)
      throw new ForbiddenException('Sin acceso a este ítem');

    const product = await this.productsService.findById(item.productId);
    if (product.stock < quantity)
      throw new BadRequestException('Stock insuficiente');

    return this.cartRepo.updateItemQuantity(itemId, quantity);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const item = await this.cartRepo.findItemById(itemId);
    if (!item) throw new NotFoundException('Ítem no encontrado');

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || item.cartId !== cart.id)
      throw new ForbiddenException('Sin acceso a este ítem');

    await this.cartRepo.removeItem(itemId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepo.findByUserId(userId);
    if (cart) await this.cartRepo.clearCart(cart.id);
  }
}
