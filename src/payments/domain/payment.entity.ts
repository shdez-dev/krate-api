import { PaymentMethod } from '../../shared/domain/value-objects/payment-method.enum';
import { PaymentStatus } from '../../shared/domain/value-objects/payment-status.enum';

export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly method: PaymentMethod,
    public status: PaymentStatus,
    public readonly amount: number,
    public paidAt: Date | null,
  ) {}
}
