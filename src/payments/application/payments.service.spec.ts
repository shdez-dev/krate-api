import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRepositoryPort } from '../domain/payment.repository.port';
import { OrdersService } from '../../orders/application/orders.service';
import { Payment } from '../domain/payment.entity';
import { Order } from '../../orders/domain/order.entity';
import { PaymentMethod } from '../../shared/domain/value-objects/payment-method.enum';
import { PaymentStatus } from '../../shared/domain/value-objects/payment-status.enum';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';

const shippingAddress = { street: 'Calle 1', city: 'Bogotá', country: 'Colombia', zip: '110111' };

const mockOrder = new Order('order-1', 'user-1', OrderStatus.PENDING, 999, shippingAddress, [], new Date());
const paidOrder = new Order('order-1', 'user-1', OrderStatus.PAID, 999, shippingAddress, [], new Date());

const mockPayment = new Payment('pay-1', 'order-1', PaymentMethod.CARD, PaymentStatus.COMPLETED, 999, new Date());

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: jest.Mocked<PaymentRepositoryPort>;
  let ordersService: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentRepositoryPort,
          useValue: {
            findByOrderId: jest.fn(),
            save: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            findById: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PaymentsService);
    paymentRepo = module.get(PaymentRepositoryPort);
    ordersService = module.get(OrdersService);
  });

  describe('create', () => {
    const dto = { orderId: 'order-1', method: PaymentMethod.CARD };

    it('registra el pago y actualiza la orden a paid', async () => {
      ordersService.findById.mockResolvedValue(mockOrder);
      paymentRepo.findByOrderId.mockResolvedValue(null);
      paymentRepo.save.mockResolvedValue(mockPayment);
      ordersService.updateStatus.mockResolvedValue(paidOrder);

      const result = await service.create('user-1', dto);
      expect(result).toBe(mockPayment);
      expect(ordersService.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.PAID);
    });

    it('lanza BadRequestException si la orden no está en pending', async () => {
      ordersService.findById.mockResolvedValue(paidOrder);
      await expect(service.create('user-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('lanza ConflictException si ya existe un pago para la orden', async () => {
      ordersService.findById.mockResolvedValue(mockOrder);
      paymentRepo.findByOrderId.mockResolvedValue(mockPayment);
      await expect(service.create('user-1', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByOrder', () => {
    it('retorna el pago si existe', async () => {
      ordersService.findById.mockResolvedValue(mockOrder);
      paymentRepo.findByOrderId.mockResolvedValue(mockPayment);
      const result = await service.findByOrder('order-1', 'user-1');
      expect(result).toBe(mockPayment);
    });

    it('lanza NotFoundException si no hay pago', async () => {
      ordersService.findById.mockResolvedValue(mockOrder);
      paymentRepo.findByOrderId.mockResolvedValue(null);
      await expect(service.findByOrder('order-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
