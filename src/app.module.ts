import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './user/user.entity';
import { Product } from './products/product.entity';
import { Cart } from './cart/cart.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: "flow9-dev-database.c5w0sgkyopb9.eu-central-1.rds.amazonaws.com",
      port: 5432,
      username: "postgres",
      password: "nm#F75$!24Gy",
      database: "myDB",
      entities: [User, Product, Cart, Order, OrderItem],
      synchronize: true, // 🔥 Auto-sync for dev only
      ssl: {
        rejectUnauthorized: false
      }
    }),
    UserModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
