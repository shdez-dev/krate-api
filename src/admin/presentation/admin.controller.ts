import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AdminService } from '../application/admin.service';
import { AdminStatsResponseDto } from './dto/admin-stats.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/presentation/guards/roles.guard';
import { Roles } from '../../shared/presentation/decorators/roles.decorator';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOkResponse({ type: AdminStatsResponseDto })
  async getStats(): Promise<AdminStatsResponseDto> {
    const stats = await this.adminService.getStats();
    return AdminStatsResponseDto.fromDomain(stats);
  }
}
