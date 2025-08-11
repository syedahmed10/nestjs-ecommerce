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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./cart.entity");
const user_entity_1 = require("../user/user.entity");
const product_entity_1 = require("../products/product.entity");
let CartService = class CartService {
    cartRepository;
    productRepository;
    userRepository;
    constructor(cartRepository, productRepository, userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    async addToCart(userId, productId, quantity) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        let cartItem = await this.cartRepository.findOne({
            where: { user: { id: userId }, product: { id: productId } },
            relations: ['user', 'product'],
        });
        if (cartItem) {
            cartItem.quantity += quantity;
        }
        else {
            cartItem = this.cartRepository.create({
                user,
                product,
                quantity,
            });
        }
        return this.cartRepository.save(cartItem);
    }
    async getUserCart(userId) {
        return this.cartRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    }
    async removeFromCart(userId, productId) {
        const cartItem = await this.cartRepository.findOne({
            where: { user: { id: userId }, product: { id: productId } },
            relations: ['user', 'product'],
        });
        if (!cartItem)
            throw new common_1.BadRequestException('Item not found in cart');
        return this.cartRepository.remove(cartItem);
    }
    async clearCart(userId) {
        const cartItems = await this.cartRepository.find({
            where: { user: { id: userId } },
        });
        return this.cartRepository.remove(cartItems);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map