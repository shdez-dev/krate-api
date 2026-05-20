import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/infrastructure/users.module';
import { AuthModule } from './auth/infrastructure/auth.module';
import { CategoriesModule } from './categories/infrastructure/categories.module';
import { ProductsModule } from './products/infrastructure/products.module';
import { CartModule } from './cart/infrastructure/cart.module';
import { OrdersModule } from './orders/infrastructure/orders.module';
import { PaymentsModule } from './payments/infrastructure/payments.module';
import { AdminModule } from './admin/infrastructure/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        database: config.get('DB_NAME'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        entities: [__dirname + '/**/*.orm-entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
