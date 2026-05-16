import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';
import { HashPort } from '../../shared/application/ports/hash.port';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly hasher: HashPort,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const passwordHash = await this.hasher.hash(dto.password);
    const user = new User(
      uuid(),
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      UserRole.CUSTOMER,
      null,
      new Date(),
    );
    return this.userRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    return this.userRepo.updateProfile(id, {
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
    });
  }

  async saveRefreshToken(id: string, token: string | null): Promise<void> {
    const hashed = token ? await this.hasher.hash(token) : null;
    await this.userRepo.updateRefreshToken(id, hashed);
  }

  async validateRefreshToken(id: string, token: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user.refreshToken) return false;
    return this.hasher.compare(token, user.refreshToken);
  }
}
