import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../shared/domain/value-objects/payment-method.enum';

export class CreatePaymentRequestDto {
  @ApiProperty({ example: 'uuid-orden' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
