import { Payment } from '../../domain/payment.entity';
import { PaymentOrmEntity } from './payment.orm-entity';

export class PaymentMapper {
  static toDomain(orm: PaymentOrmEntity): Payment {
    return new Payment(
      orm.id,
      orm.orderId,
      orm.method,
      orm.status,
      Number(orm.amount),
      orm.paidAt,
    );
  }

  static toOrm(domain: Payment): PaymentOrmEntity {
    const entity = new PaymentOrmEntity();
    entity.id = domain.id;
    entity.orderId = domain.orderId;
    entity.method = domain.method;
    entity.status = domain.status;
    entity.amount = domain.amount;
    entity.paidAt = domain.paidAt;
    return entity;
  }
}
