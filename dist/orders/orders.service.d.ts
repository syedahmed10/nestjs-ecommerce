import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
export declare class OrdersService {
    private prisma;
    private payments;
    constructor(prisma: PrismaService, payments: PaymentsService);
    checkout(userId: string, items: {
        productId: string;
        qty: number;
        price: number;
    }[], idempotencyKey?: string): Promise<any>;
    findByUser(userId: string): any;
}
