import { IsString, IsOptional, IsNumber, Min, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Laptop Pro 15' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Laptop de alto rendimiento' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/product.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'uuid-categoria' })
  @IsUUID()
  categoryId: string;
}
