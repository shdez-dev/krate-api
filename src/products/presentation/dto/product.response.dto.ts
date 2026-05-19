import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() price: number;
  @ApiProperty() stock: number;
  @ApiPropertyOptional() imageUrl: string | null;
  @ApiProperty() categoryId: string;
  @ApiProperty() createdAt: Date;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.price = product.price;
    dto.stock = product.stock;
    dto.imageUrl = product.imageUrl;
    dto.categoryId = product.categoryId;
    dto.createdAt = product.createdAt;
    return dto;
  }
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] }) data: ProductResponseDto[];
  @ApiProperty() total: number;
}
