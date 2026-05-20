import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PaymentsService } from '../application/payments.service';
import { CreatePaymentRequestDto } from './dto/create-payment.request.dto';
import { PaymentResponseDto } from './dto/payment.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { User } from '../../users/domain/user.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiCreatedResponse({ type: PaymentResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.create(user.id, dto);
    return PaymentResponseDto.fromDomain(payment);
  }

  @Get('order/:orderId')
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse()
  async findByOrder(
    @CurrentUser() user: User,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.findByOrder(orderId, user.id);
    return PaymentResponseDto.fromDomain(payment);
  }
}
