import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaymentsService } from '../payments/payments.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private payments: PaymentsService,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  /**
   * items: [{ productId, qty, price }]
   * userId: string
   * idempotencyKey: string (to avoid double charging)
   */
  async checkout(userId: string, items: { productId: string; qty: number; price: number }[], idempotencyKey?: string) {
    // compute total
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);

    // transaction: verify stock, create order and items, decrement stock
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify stock for all items
      for (const item of items) {
        const product = await this.productsService.findOne(item.productId);
        if (product.stock < item.qty) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
      }

      // Create order
      const order = queryRunner.manager.create(Order, {
        user: { id: userId } as any,
        totalAmount: total,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await queryRunner.manager.save(order);

      // Create order items and update stock
      for (const item of items) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: { id: item.productId } as any,
          price: item.price,
          quantity: item.qty,
        });
        await queryRunner.manager.save(orderItem);

        // Update product stock
        const product = await this.productsService.findOne(item.productId);
        product.stock -= item.qty;
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();

      // call payment gateway (outside DB transaction)
      const payment = await this.payments.charge({ 
        amount: total, 
        currency: 'usd', 
        metadata: { orderId: savedOrder.id }, 
        idempotencyKey 
      });

      if (payment.status !== 'succeeded') {
        // Mark order as cancelled if payment fails
        savedOrder.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(savedOrder);
        throw new BadRequestException('Payment failed');
      }

      // Update order status to paid
      savedOrder.status = OrderStatus.PROCESSING;
      await this.orderRepository.save(savedOrder);

      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'user']
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user']
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.status = status;
    return this.orderRepository.save(order);
  }
}
