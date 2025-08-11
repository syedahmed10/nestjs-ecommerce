import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private payments: PaymentsService) {}

  /**
   * items: [{ productId, qty, price }]
   * userId: string
   * idempotencyKey: string (to avoid double charging)
   */
  async checkout(userId: string, items: { productId: string; qty: number; price: number }[], idempotencyKey?: string) {
    // compute total
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);

    // idempotency: if an order with this key exists, return it instead of charging again
    if (idempotencyKey) {
      const existing = await this.prisma.order.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;
    }

    // transaction: verify stock, create order and items, decrement stock
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        if (!p) throw new BadRequestException(`Product not found: ${item.productId}`);
        if (p.stock < item.qty) throw new BadRequestException(`Insufficient stock for ${p.name}`);
      }

      const created = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          idempotencyKey: idempotencyKey ?? undefined
        }
      });

      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            price: item.price,
            qty: item.qty
          }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } }
        });
      }
      return created;
    });

    // call payment gateway (outside DB transaction)
    const payment = await this.payments.charge({ amount: total, currency: 'usd', metadata: { orderId: order.id }, idempotencyKey });

    if (payment.status !== 'succeeded') {
      // optionally refund or revert stock — for simplicity mark order CANCELLED
      await this.prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      throw new BadRequestException('Payment failed');
    }

    await this.prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
    return this.prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, include: { items: true } });
  }
}
