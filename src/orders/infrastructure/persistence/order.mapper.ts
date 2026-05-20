import { Order } from '../../domain/order.entity';
import { OrderItem } from '../../domain/order-item.entity';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderItemOrmEntity } from './order-item.orm-entity';

export class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order {
    const items = (orm.items ?? []).map((item) =>
      OrderMapper.itemToDomain(item),
    );
    return new Order(
      orm.id,
      orm.userId,
      orm.status,
      Number(orm.total),
      orm.shippingAddress,
      items,
      orm.createdAt,
    );
  }

  static itemToDomain(orm: OrderItemOrmEntity): OrderItem {
    return new OrderItem(
      orm.id,
      orm.orderId,
      orm.productId,
      orm.productName,
      Number(orm.unitPrice),
      orm.quantity,
    );
  }
}
