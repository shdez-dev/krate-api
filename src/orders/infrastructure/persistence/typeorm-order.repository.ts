import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../domain/order.entity';
import { OrderRepositoryPort } from '../../domain/order.repository.port';
import { OrderStatus } from '../../../shared/domain/value-objects/order-status.enum';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderMapper } from './order.mapper';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepositoryPort {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repo: Repository<OrderOrmEntity>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? OrderMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const results = await this.repo.find({ where: { userId } });
    return results.map((o) => OrderMapper.toDomain(o));
  }

  async findAll(): Promise<Order[]> {
    const results = await this.repo.find();
    return results.map((o) => OrderMapper.toDomain(o));
  }

  async save(order: Order): Promise<Order> {
    const orm = await this.repo.findOneOrFail({ where: { id: order.id } });
    return OrderMapper.toDomain(orm);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.repo.update(id, { status });
    const orm = await this.repo.findOneOrFail({ where: { id } });
    return OrderMapper.toDomain(orm);
  }
}
