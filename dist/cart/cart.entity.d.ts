import { User } from '../user/user.entity';
import { Product } from '../products/product.entity';
export declare class Cart {
    id: string;
    user: User;
    product: Product;
    quantity: number;
}
