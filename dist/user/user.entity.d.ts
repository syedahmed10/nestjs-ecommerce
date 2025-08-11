import { Order } from '../../order/';
import { Cart } from '../../cart/entities/cart.entity';
export declare enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    orders: Order[];
    cartItems: Cart[];
    createdAt: Date;
}
