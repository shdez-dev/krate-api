import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../domain/order.entity';
import { OrderItem } from '../../domain/order-item.entity';
import { OrderStatus } from '../../../shared/domain/value-objects/order-status.enum';

export class OrderItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() unitPrice: number;
  @ApiProperty() quantity: number;
  @ApiProperty() subtotal: number;

  static fromDomain(item: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = item.id;
    dto.productId = item.productId;
    dto.productName = item.productName;
    dto.unitPrice = item.unitPrice;
    dto.quantity = item.quantity;
    dto.subtotal = item.subtotal;
    return dto;
  }
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty() total: number;
  @ApiProperty() shippingAddress: object;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
  @ApiProperty() createdAt: Date;

  static fromDomain(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.userId = order.userId;
    dto.status = order.status;
    dto.total = order.total;
    dto.shippingAddress = order.shippingAddress;
    dto.items = order.items.map(OrderItemResponseDto.fromDomain);
    dto.createdAt = order.createdAt;
    return dto;
  }
}
