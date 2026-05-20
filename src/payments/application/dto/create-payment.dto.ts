import { PaymentMethod } from '../../../shared/domain/value-objects/payment-method.enum';

export interface CreatePaymentDto {
  orderId: string;
  method: PaymentMethod;
}
