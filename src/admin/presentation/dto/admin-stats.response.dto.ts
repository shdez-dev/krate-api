import { ApiProperty } from '@nestjs/swagger';
import { AdminStats, MonthlySales, TopProduct } from '../../application/admin.service';

export class MonthlySalesDto {
  @ApiProperty() month: string;
  @ApiProperty() total: number;
  @ApiProperty() count: number;
}

export class TopProductDto {
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() totalSold: number;
}

export class AdminStatsResponseDto {
  @ApiProperty() totalUsers: number;
  @ApiProperty({ type: [MonthlySalesDto] }) monthlySales: MonthlySalesDto[];
  @ApiProperty({ type: [TopProductDto] }) topProducts: TopProductDto[];

  static fromDomain(stats: AdminStats): AdminStatsResponseDto {
    const dto = new AdminStatsResponseDto();
    dto.totalUsers = stats.totalUsers;
    dto.monthlySales = stats.monthlySales;
    dto.topProducts = stats.topProducts;
    return dto;
  }
}
