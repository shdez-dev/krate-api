import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../application/users.service';
import { UpdateProfileRequestDto } from './dto/update-profile.request.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { User } from '../domain/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  getProfile(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.fromDomain(user);
  }

  @Put('me')
  @ApiOkResponse({ type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return UserResponseDto.fromDomain(updated);
  }
}
