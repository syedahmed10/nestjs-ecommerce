import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addToCart(userId: string, productId: string, quantity: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    let cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepository.create({
        user,
        product,
        quantity,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async getUserCart(userId: string) {
    return this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async removeFromCart(userId: string, productId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (!cartItem) throw new BadRequestException('Item not found in cart');

    return this.cartRepository.remove(cartItem);
  }

  async clearCart(userId: string) {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
    });

    return this.cartRepository.remove(cartItems);
  }
}
