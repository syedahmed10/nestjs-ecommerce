import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  async checkout(@Request() req, @Body() body: { items: any[]; idempotencyKey?: string }) {
    const userId = req.user.id;
    return this.orders.checkout(userId, body.items, body.idempotencyKey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  myOrders(@Request() req) {
    return this.orders.findByUser(req.user.id);
  }
}
