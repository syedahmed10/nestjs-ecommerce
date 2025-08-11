import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/product.entity';
export declare class CartService {
    private readonly cartRepository;
    private readonly productRepository;
    private readonly userRepository;
    constructor(cartRepository: Repository<Cart>, productRepository: Repository<Product>, userRepository: Repository<User>);
    addToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
    getUserCart(userId: string): Promise<Cart[]>;
    removeFromCart(userId: string, productId: string): Promise<Cart>;
    clearCart(userId: string): Promise<Cart[]>;
}
