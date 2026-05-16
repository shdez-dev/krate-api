import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshRequestDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
