import { Payment } from './payment.entity';

export abstract class PaymentRepositoryPort {
  abstract findByOrderId(orderId: string): Promise<Payment | null>;
  abstract save(payment: Payment): Promise<Payment>;
  abstract updateStatus(id: string, status: string, paidAt: Date | null): Promise<Payment>;
}
