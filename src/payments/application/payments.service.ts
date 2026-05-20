import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Payment } from '../domain/payment.entity';
import { PaymentRepositoryPort } from '../domain/payment.repository.port';
import { PaymentStatus } from '../../shared/domain/value-objects/payment-status.enum';
import { OrdersService } from '../../orders/application/orders.service';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepo: PaymentRepositoryPort,
    private readonly ordersService: OrdersService,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    const order = await this.ordersService.findById(
      dto.orderId,
      userId,
      UserRole.CUSTOMER,
    );

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden pagar órdenes en estado pending',
      );
    }

    const existing = await this.paymentRepo.findByOrderId(dto.orderId);
    if (existing)
      throw new ConflictException('Esta orden ya tiene un pago registrado');

    const payment = new Payment(
      uuid(),
      dto.orderId,
      dto.method,
      PaymentStatus.COMPLETED,
      order.total,
      new Date(),
    );

    const saved = await this.paymentRepo.save(payment);

    // Emite evento interno: actualiza la orden a PAID
    await this.ordersService.updateStatus(dto.orderId, OrderStatus.PAID);

    return saved;
  }

  async findByOrder(orderId: string, userId: string): Promise<Payment> {
    await this.ordersService.findById(orderId, userId, UserRole.CUSTOMER);
    const payment = await this.paymentRepo.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }
}
