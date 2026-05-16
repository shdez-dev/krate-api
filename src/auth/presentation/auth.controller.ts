import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { RegisterRequestDto } from './dto/register.request.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../shared/presentation/guards/jwt-refresh.guard';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { User } from '../../users/domain/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: AuthTokensResponseDto })
  register(@Body() dto: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensResponseDto })
  login(@Body() dto: LoginRequestDto): Promise<AuthTokensResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensResponseDto })
  refresh(
    @Request() req: { user: { id: string; refreshToken: string } },
  ): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(req.user.id, req.user.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return { message: 'Sesión cerrada correctamente' };
  }
}
