import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressRequestDto {
  @ApiProperty({ example: 'Calle 123' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Colombia' })
  @IsString()
  country: string;

  @ApiProperty({ example: '110111' })
  @IsString()
  zip: string;
}

export class CreateOrderRequestDto {
  @ApiProperty({ type: ShippingAddressRequestDto })
  @ValidateNested()
  @Type(() => ShippingAddressRequestDto)
  shippingAddress: ShippingAddressRequestDto;
}
