import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrmEntity } from './persistence/payment.orm-entity';
import { TypeOrmPaymentRepository } from './persistence/typeorm-payment.repository';
import { PaymentRepositoryPort } from '../domain/payment.repository.port';
import { PaymentsService } from '../application/payments.service';
import { PaymentsController } from '../presentation/payments.controller';
import { OrdersModule } from '../../orders/infrastructure/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity]), OrdersModule],
  providers: [
    PaymentsService,
    { provide: PaymentRepositoryPort, useClass: TypeOrmPaymentRepository },
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
