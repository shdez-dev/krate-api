import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Payment } from '../../domain/payment.entity';
import { PaymentMethod } from '../../../shared/domain/value-objects/payment-method.enum';
import { PaymentStatus } from '../../../shared/domain/value-objects/payment-status.enum';

export class PaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() orderId: string;
  @ApiProperty({ enum: PaymentMethod }) method: PaymentMethod;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty() amount: number;
  @ApiPropertyOptional() paidAt: Date | null;

  static fromDomain(payment: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = payment.id;
    dto.orderId = payment.orderId;
    dto.method = payment.method;
    dto.status = payment.status;
    dto.amount = payment.amount;
    dto.paidAt = payment.paidAt;
    return dto;
  }
}
