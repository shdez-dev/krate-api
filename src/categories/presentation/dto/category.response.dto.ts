import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../domain/category.entity';

export class CategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string | null;
  @ApiPropertyOptional() parentId: string | null;
  @ApiProperty() createdAt: Date;

  static fromDomain(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.description = category.description;
    dto.parentId = category.parentId;
    dto.createdAt = category.createdAt;
    return dto;
  }
}
