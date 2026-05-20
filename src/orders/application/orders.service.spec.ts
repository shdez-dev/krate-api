import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrderRepositoryPort } from '../domain/order.repository.port';
import { CartRepositoryPort } from '../../cart/domain/cart.repository.port';
import { Order } from '../domain/order.entity';
import { Cart } from '../../cart/domain/cart.entity';
import { CartItem } from '../../cart/domain/cart-item.entity';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

const shippingAddress = { street: 'Calle 1', city: 'Bogotá', country: 'Colombia', zip: '110111' };

const mockOrder = new Order(
  'order-1',
  'user-1',
  OrderStatus.PENDING,
  999,
  shippingAddress,
  [],
  new Date(),
);

const mockCart = new Cart(
  'cart-1',
  'user-1',
  [new CartItem('item-1', 'cart-1', 'prod-1', 2)],
  new Date(),
);

const emptyCart = new Cart('cart-1', 'user-1', [], new Date());

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<OrderRepositoryPort>;
  let cartRepo: jest.Mocked<CartRepositoryPort>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderRepositoryPort,
          useValue: {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: CartRepositoryPort,
          useValue: {
            findByUserId: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    orderRepo = module.get(OrderRepositoryPort);
    cartRepo = module.get(CartRepositoryPort);
    dataSource = module.get(DataSource);
  });

  describe('findById', () => {
    it('retorna la orden si el usuario es el dueño', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder);
      const result = await service.findById('order-1', 'user-1', UserRole.CUSTOMER);
      expect(result).toBe(mockOrder);
    });

    it('permite acceso a admin aunque no sea el dueño', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder);
      const result = await service.findById('order-1', 'admin-id', UserRole.ADMIN);
      expect(result).toBe(mockOrder);
    });

    it('lanza NotFoundException si no existe', async () => {
      orderRepo.findById.mockResolvedValue(null);
      await expect(service.findById('order-x', 'user-1', UserRole.CUSTOMER))
        .rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el usuario no es el dueño', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder);
      await expect(service.findById('order-1', 'other-user', UserRole.CUSTOMER))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByUser', () => {
    it('retorna las órdenes del usuario', async () => {
      orderRepo.findByUserId.mockResolvedValue([mockOrder]);
      const result = await service.findByUser('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('lanza BadRequestException si el carrito está vacío', async () => {
      cartRepo.findByUserId.mockResolvedValue(emptyCart);
      await expect(service.create('user-1', { shippingAddress }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si no hay carrito', async () => {
      cartRepo.findByUserId.mockResolvedValue(null);
      await expect(service.create('user-1', { shippingAddress }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('actualiza el estado correctamente', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder);
      const updated = { ...mockOrder, status: OrderStatus.PAID } as Order;
      orderRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.updateStatus('order-1', OrderStatus.PAID);
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('lanza NotFoundException si no existe', async () => {
      orderRepo.findById.mockResolvedValue(null);
      await expect(service.updateStatus('order-x', OrderStatus.PAID))
        .rejects.toThrow(NotFoundException);
    });
  });
});
