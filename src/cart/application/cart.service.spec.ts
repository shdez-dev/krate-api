import { Test } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartRepositoryPort } from '../domain/cart.repository.port';
import { ProductsService } from '../../products/application/products.service';
import { Cart } from '../domain/cart.entity';
import { CartItem } from '../domain/cart-item.entity';
import { Product } from '../../products/domain/product.entity';

const mockProduct = new Product(
  'prod-1',
  'Laptop',
  null,
  999,
  10,
  null,
  'cat-1',
  null,
  new Date(),
);
const mockItem = new CartItem('item-1', 'cart-1', 'prod-1', 2);
const mockCart = new Cart('cart-1', 'user-1', [mockItem], new Date());

describe('CartService', () => {
  let service: CartService;
  let cartRepo: jest.Mocked<CartRepositoryPort>;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepositoryPort,
          useValue: {
            findByUserId: jest.fn(),
            findOrCreateByUserId: jest.fn(),
            findItemById: jest.fn(),
            addItem: jest.fn(),
            updateItemQuantity: jest.fn(),
            removeItem: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CartService);
    cartRepo = module.get(CartRepositoryPort);
    productsService = module.get(ProductsService);
  });

  describe('getCart', () => {
    it('retorna el carrito del usuario', async () => {
      cartRepo.findOrCreateByUserId.mockResolvedValue(mockCart);
      const result = await service.getCart('user-1');
      expect(result).toBe(mockCart);
    });
  });

  describe('addItem', () => {
    it('agrega un ítem correctamente', async () => {
      productsService.findById.mockResolvedValue(mockProduct);
      cartRepo.findOrCreateByUserId.mockResolvedValue(mockCart);
      cartRepo.addItem.mockResolvedValue(mockItem);

      const result = await service.addItem('user-1', {
        productId: 'prod-1',
        quantity: 2,
      });
      expect(result).toBe(mockItem);
    });

    it('lanza BadRequestException si la cantidad es 0', async () => {
      productsService.findById.mockResolvedValue(mockProduct);
      await expect(
        service.addItem('user-1', { productId: 'prod-1', quantity: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si no hay stock suficiente', async () => {
      const lowStock = new Product(
        'prod-1',
        'Laptop',
        null,
        999,
        1,
        null,
        'cat-1',
        null,
        new Date(),
      );
      productsService.findById.mockResolvedValue(lowStock);
      await expect(
        service.addItem('user-1', { productId: 'prod-1', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('actualiza la cantidad correctamente', async () => {
      cartRepo.findItemById.mockResolvedValue(mockItem);
      cartRepo.findByUserId.mockResolvedValue(mockCart);
      productsService.findById.mockResolvedValue(mockProduct);
      const updated = new CartItem('item-1', 'cart-1', 'prod-1', 3);
      cartRepo.updateItemQuantity.mockResolvedValue(updated);

      const result = await service.updateItem('user-1', 'item-1', 3);
      expect(result.quantity).toBe(3);
    });

    it('lanza NotFoundException si el ítem no existe', async () => {
      cartRepo.findItemById.mockResolvedValue(null);
      await expect(service.updateItem('user-1', 'item-x', 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza ForbiddenException si el ítem no pertenece al usuario', async () => {
      const otherItem = new CartItem('item-1', 'other-cart', 'prod-1', 2);
      cartRepo.findItemById.mockResolvedValue(otherItem);
      cartRepo.findByUserId.mockResolvedValue(mockCart);
      await expect(service.updateItem('user-1', 'item-1', 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('removeItem', () => {
    it('elimina el ítem correctamente', async () => {
      cartRepo.findItemById.mockResolvedValue(mockItem);
      cartRepo.findByUserId.mockResolvedValue(mockCart);
      cartRepo.removeItem.mockResolvedValue();

      await service.removeItem('user-1', 'item-1');
      expect(cartRepo.removeItem).toHaveBeenCalledWith('item-1');
    });

    it('lanza NotFoundException si el ítem no existe', async () => {
      cartRepo.findItemById.mockResolvedValue(null);
      await expect(service.removeItem('user-1', 'item-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearCart', () => {
    it('vacía el carrito correctamente', async () => {
      cartRepo.findByUserId.mockResolvedValue(mockCart);
      cartRepo.clearCart.mockResolvedValue();

      await service.clearCart('user-1');
      expect(cartRepo.clearCart).toHaveBeenCalledWith('cart-1');
    });
  });
});
