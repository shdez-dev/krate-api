import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { ProductsService } from '../application/products.service';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { UpdateProductRequestDto } from './dto/update-product.request.dto';
import { ProductFiltersQueryDto } from './dto/product-filters.query.dto';
import {
  ProductResponseDto,
  PaginatedProductsResponseDto,
} from './dto/product.response.dto';
import { JwtAuthGuard } from '../../shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/presentation/guards/roles.guard';
import { Roles } from '../../shared/presentation/decorators/roles.decorator';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  async findAll(
    @Query() filters: ProductFiltersQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const result = await this.productsService.findAll(filters);
    return {
      data: result.data.map((p) => ProductResponseDto.fromDomain(p)),
      total: result.total,
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    return ProductResponseDto.fromDomain(product);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: ProductResponseDto })
  async create(
    @Body() dto: CreateProductRequestDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto);
    return ProductResponseDto.fromDomain(product);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, dto);
    return ProductResponseDto.fromDomain(product);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  softDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.softDelete(id);
  }
}
