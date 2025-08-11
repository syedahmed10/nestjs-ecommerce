import { OrdersService } from './orders.service';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    checkout(req: any, body: {
        items: any[];
        idempotencyKey?: string;
    }): Promise<any>;
    myOrders(req: any): any;
}
