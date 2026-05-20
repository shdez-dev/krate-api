import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { HashPort } from '../../shared/application/ports/hash.port';
import { User } from '../domain/user.entity';
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

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<UserRepositoryPort>;
  let hasher: jest.Mocked<HashPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepositoryPort,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
            updateRefreshToken: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
        {
          provide: HashPort,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepo = module.get(UserRepositoryPort);
    hasher = module.get(HashPort);
  });

  describe('findById', () => {
    it('retorna el usuario si existe', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const result = await service.findById('uuid-1');
      expect(result).toBe(mockUser);
    });

    it('lanza NotFoundException si no existe', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.findById('uuid-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const dto = {
      email: 'new@krate.dev',
      password: 'pass1234',
      firstName: 'New',
      lastName: 'User',
    };

    it('crea el usuario correctamente', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      hasher.hash.mockResolvedValue('hashed');
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);
      expect(hasher.hash).toHaveBeenCalledWith(dto.password);
      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('lanza ConflictException si el email ya existe', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('actualiza el perfil correctamente', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const updated = { ...mockUser, firstName: 'Seba' };
      userRepo.updateProfile.mockResolvedValue(updated);

      const result = await service.updateProfile('uuid-1', {
        firstName: 'Seba',
      });
      expect(result.firstName).toBe('Seba');
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.updateProfile('uuid-x', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('saveRefreshToken', () => {
    it('guarda el token hasheado', async () => {
      hasher.hash.mockResolvedValue('hashed_token');
      await service.saveRefreshToken('uuid-1', 'raw_token');
      expect(hasher.hash).toHaveBeenCalledWith('raw_token');
      expect(userRepo.updateRefreshToken).toHaveBeenCalledWith(
        'uuid-1',
        'hashed_token',
      );
    });

    it('guarda null al hacer logout', async () => {
      await service.saveRefreshToken('uuid-1', null);
      expect(userRepo.updateRefreshToken).toHaveBeenCalledWith('uuid-1', null);
    });
  });

  describe('validateRefreshToken', () => {
    it('retorna true si el token es válido', async () => {
      const userWithToken = {
        ...mockUser,
        refreshToken: 'hashed_token',
      } as User;
      userRepo.findById.mockResolvedValue(userWithToken);
      hasher.compare.mockResolvedValue(true);

      const result = await service.validateRefreshToken('uuid-1', 'raw_token');
      expect(result).toBe(true);
    });

    it('retorna false si no hay refresh token guardado', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const result = await service.validateRefreshToken('uuid-1', 'raw_token');
      expect(result).toBe(false);
    });
  });
});
