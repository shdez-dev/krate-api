import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { OrdersService } from '../application/orders.service';
import { CreateOrderRequestDto } from './dto/create-order.request.dto';
import { UpdateOrderStatusRequestDto } from './dto/update-order-status.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/presentation/guards/roles.guard';
import { Roles } from '../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';
import { User } from '../../users/domain/user.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  async findMyOrders(@CurrentUser() user: User): Promise<OrderResponseDto[]> {
    const orders = await this.ordersService.findByUser(user.id);
    return orders.map(OrderResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse()
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.findById(id, user.id, user.role);
    return OrderResponseDto.fromDomain(order);
  }

  @Post()
  @ApiCreatedResponse({ type: OrderResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.create(user.id, dto);
    return OrderResponseDto.fromDomain(order);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse()
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusRequestDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.updateStatus(id, dto.status);
    return OrderResponseDto.fromDomain(order);
  }
}
