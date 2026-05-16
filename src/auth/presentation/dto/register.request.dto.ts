import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Sebastian' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Hernandez' })
  @IsString()
  @MaxLength(100)
  lastName: string;
}
