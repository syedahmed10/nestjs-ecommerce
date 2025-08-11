"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("../payments/payments.service");
let OrdersService = class OrdersService {
    prisma;
    payments;
    constructor(prisma, payments) {
        this.prisma = prisma;
        this.payments = payments;
    }
    async checkout(userId, items, idempotencyKey) {
        const total = items.reduce((s, it) => s + it.price * it.qty, 0);
        if (idempotencyKey) {
            const existing = await this.prisma.order.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
        }
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                const p = await tx.product.findUnique({ where: { id: item.productId } });
                if (!p)
                    throw new common_1.BadRequestException(`Product not found: ${item.productId}`);
                if (p.stock < item.qty)
                    throw new common_1.BadRequestException(`Insufficient stock for ${p.name}`);
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
        const payment = await this.payments.charge({ amount: total, currency: 'usd', metadata: { orderId: order.id }, idempotencyKey });
        if (payment.status !== 'succeeded') {
            await this.prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
            throw new common_1.BadRequestException('Payment failed');
        }
        await this.prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
        return this.prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
    }
    findByUser(userId) {
        return this.prisma.order.findMany({ where: { userId }, include: { items: true } });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, payments_service_1.PaymentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map