import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { Product } from '../products/product.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product, User])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
