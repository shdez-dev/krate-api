import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/application/users.service';
import { HashPort } from '../../shared/application/ports/hash.port';
import { User } from '../../users/domain/user.entity';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

const mockUser = new User(
  'uuid-1',
  'user@krate.dev',
  'hashed_password',
  'Sebastian',
  'Hernandez',
  UserRole.CUSTOMER,
  null,
  new Date(),
);

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let hasher: jest.Mocked<HashPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            saveRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('secret') },
        },
        {
          provide: HashPort,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    hasher = module.get(HashPort);
  });

  describe('register', () => {
    it('registra y retorna tokens', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.saveRefreshToken.mockResolvedValue();

      const result = await service.register({
        email: 'user@krate.dev',
        password: 'pass1234',
        firstName: 'Sebastian',
        lastName: 'Hernandez',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(usersService.saveRefreshToken).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna tokens con credenciales válidas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      hasher.compare.mockResolvedValue(true);
      usersService.saveRefreshToken.mockResolvedValue();

      const result = await service.login({
        email: 'user@krate.dev',
        password: 'pass1234',
      });
      expect(result.accessToken).toBeDefined();
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@krate.dev', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      hasher.compare.mockResolvedValue(false);
      await expect(
        service.login({ email: 'user@krate.dev', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('retorna nuevos tokens con refresh válido', async () => {
      usersService.validateRefreshToken.mockResolvedValue(true);
      usersService.findById.mockResolvedValue(mockUser);
      usersService.saveRefreshToken.mockResolvedValue();

      const result = await service.refresh('uuid-1', 'raw_token');
      expect(result.accessToken).toBeDefined();
    });

    it('lanza UnauthorizedException con refresh inválido', async () => {
      usersService.validateRefreshToken.mockResolvedValue(false);
      await expect(service.refresh('uuid-1', 'bad_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('invalida el refresh token', async () => {
      usersService.saveRefreshToken.mockResolvedValue();
      await service.logout('uuid-1');
      expect(usersService.saveRefreshToken).toHaveBeenCalledWith(
        'uuid-1',
        null,
      );
    });
  });
});
