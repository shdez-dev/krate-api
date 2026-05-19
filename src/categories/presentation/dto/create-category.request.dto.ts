import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryRequestDto {
  @ApiProperty({ example: 'Electrónica' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Dispositivos electrónicos y accesorios' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-padre' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
