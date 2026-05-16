import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './persistence/user.orm-entity';
import { TypeOrmUserRepository } from './persistence/typeorm-user.repository';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { UsersService } from '../application/users.service';
import { UsersController } from '../presentation/users.controller';
import { HashPort } from '../../shared/application/ports/hash.port';
import { BcryptService } from '../../shared/infrastructure/services/bcrypt.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    UsersService,
    { provide: UserRepositoryPort, useClass: TypeOrmUserRepository },
    { provide: HashPort, useClass: BcryptService },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
