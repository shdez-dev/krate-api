import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../../domain/cart.entity';
import { CartItem } from '../../domain/cart-item.entity';

export class CartItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;

  static fromDomain(item: CartItem): CartItemResponseDto {
    const dto = new CartItemResponseDto();
    dto.id = item.id;
    dto.productId = item.productId;
    dto.quantity = item.quantity;
    return dto;
  }
}

export class CartResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ type: [CartItemResponseDto] }) items: CartItemResponseDto[];
  @ApiProperty() createdAt: Date;

  static fromDomain(cart: Cart): CartResponseDto {
    const dto = new CartResponseDto();
    dto.id = cart.id;
    dto.userId = cart.userId;
    dto.items = cart.items.map((item) => CartItemResponseDto.fromDomain(item));
    dto.createdAt = cart.createdAt;
    return dto;
  }
}
