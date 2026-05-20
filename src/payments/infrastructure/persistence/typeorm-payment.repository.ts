import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/payment.entity';
import { PaymentRepositoryPort } from '../../domain/payment.repository.port';
import { PaymentOrmEntity } from './payment.orm-entity';
import { PaymentMapper } from './payment.mapper';
import { PaymentStatus } from '../../../shared/domain/value-objects/payment-status.enum';

@Injectable()
export class TypeOrmPaymentRepository implements PaymentRepositoryPort {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repo: Repository<PaymentOrmEntity>,
  ) {}

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const orm = await this.repo.findOne({ where: { orderId } });
    return orm ? PaymentMapper.toDomain(orm) : null;
  }

  async save(payment: Payment): Promise<Payment> {
    const orm = PaymentMapper.toOrm(payment);
    const saved = await this.repo.save(orm);
    return PaymentMapper.toDomain(saved);
  }

  async updateStatus(
    id: string,
    status: string,
    paidAt: Date | null,
  ): Promise<Payment> {
    await this.repo.update(id, { status: status as PaymentStatus, paidAt });
    const orm = await this.repo.findOneOrFail({ where: { id } });
    return PaymentMapper.toDomain(orm);
  }
}
