import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../users/infrastructure/persistence/user.orm-entity';
import { OrderOrmEntity } from '../../orders/infrastructure/persistence/order.orm-entity';
import { OrderStatus } from '../../shared/domain/value-objects/order-status.enum';

export interface MonthlySales {
  month: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
}

export interface AdminStats {
  totalUsers: number;
  monthlySales: MonthlySales[];
  topProducts: TopProduct[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepo: Repository<OrderOrmEntity>,
  ) {}

  async getStats(): Promise<AdminStats> {
    const [totalUsers, monthlySales, topProducts] = await Promise.all([
      this.userRepo.count(),
      this.getMonthlySales(),
      this.getTopProducts(),
    ]);

    return { totalUsers, monthlySales, topProducts };
  }

  private async getMonthlySales(): Promise<MonthlySales[]> {
    const results = await this.orderRepo
      .createQueryBuilder('order')
      .select("DATE_FORMAT(order.created_at, '%Y-%m')", 'month')
      .addSelect('SUM(order.total)', 'total')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany<{ month: string; total: string; count: string }>();

    return results.map((r) => ({
      month: r.month,
      total: Number(r.total),
      count: Number(r.count),
    }));
  }

  private async getTopProducts(): Promise<TopProduct[]> {
    const results = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .select('item.product_id', 'productId')
      .addSelect('item.product_name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      })
      .groupBy('item.product_id')
      .addGroupBy('item.product_name')
      .orderBy('totalSold', 'DESC')
      .limit(5)
      .getRawMany<{ productId: string; productName: string; totalSold: string }>();

    return results.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      totalSold: Number(r.totalSold),
    }));
  }
}
