import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../../users/infrastructure/persistence/user.orm-entity';
import { OrderOrmEntity } from '../../orders/infrastructure/persistence/order.orm-entity';
import { AdminService } from '../application/admin.service';
import { AdminController } from '../presentation/admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, OrderOrmEntity])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
