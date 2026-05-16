import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/application/users.service';
import { HashPort } from '../../shared/application/ports/hash.port';
import { RegisterRequestDto } from '../presentation/dto/register.request.dto';
import { LoginRequestDto } from '../presentation/dto/login.request.dto';
import { AuthTokensResponseDto } from '../presentation/dto/auth-tokens.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly hasher: HashPort,
  ) {}

  async register(dto: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginRequestDto): Promise<AuthTokensResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, token: string): Promise<AuthTokensResponseDto> {
    const valid = await this.usersService.validateRefreshToken(userId, token);
    if (!valid) throw new UnauthorizedException('Refresh token inválido');

    const user = await this.usersService.findById(userId);
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.saveRefreshToken(userId, null);
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokensResponseDto> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
