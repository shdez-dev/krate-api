import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async save(user: User): Promise<User> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.repo.update(id, { refreshToken: token });
  }

  async updateProfile(
    id: string,
    data: Pick<User, 'firstName' | 'lastName'>,
  ): Promise<User> {
    await this.repo.update(id, data);
    const orm = await this.repo.findOneOrFail({ where: { id } });
    return UserMapper.toDomain(orm);
  }
}
