import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CartService } from '../application/cart.service';
import { AddItemRequestDto } from './dto/add-item.request.dto';
import { UpdateItemRequestDto } from './dto/update-item.request.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { User } from '../../users/domain/user.entity';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOkResponse({ type: CartResponseDto })
  async getCart(@CurrentUser() user: User): Promise<CartResponseDto> {
    const cart = await this.cartService.getCart(user.id);
    return CartResponseDto.fromDomain(cart);
  }

  @Post('items')
  @ApiCreatedResponse({ type: CartItemResponseDto })
  async addItem(
    @CurrentUser() user: User,
    @Body() dto: AddItemRequestDto,
  ): Promise<CartItemResponseDto> {
    const item = await this.cartService.addItem(user.id, dto);
    return CartItemResponseDto.fromDomain(item);
  }

  @Patch('items/:id')
  @ApiOkResponse({ type: CartItemResponseDto })
  @ApiNotFoundResponse()
  async updateItem(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemRequestDto,
  ): Promise<CartItemResponseDto> {
    const item = await this.cartService.updateItem(user.id, id, dto.quantity);
    return CartItemResponseDto.fromDomain(item);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  removeItem(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.cartService.removeItem(user.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  clearCart(@CurrentUser() user: User): Promise<void> {
    return this.cartService.clearCart(user.id);
  }
}
