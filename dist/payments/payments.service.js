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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("@nestjs/config");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    config;
    stripe;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(config) {
        this.config = config;
        const key = this.config.get('STRIPE_SECRET') || '';
        this.stripe = new stripe_1.default(key, { apiVersion: '2022-11-15' });
    }
    async charge(payload) {
        try {
            const intent = await this.stripe.paymentIntents.create({
                amount: payload.amount,
                currency: payload.currency,
                metadata: payload.metadata
            }, { idempotencyKey: payload.idempotencyKey });
            if (intent.status === 'succeeded') {
                return { status: 'succeeded', id: intent.id };
            }
            return { status: 'succeeded', id: intent.id };
        }
        catch (err) {
            this.logger.error('Stripe charge failed', err);
            return { status: 'failed', error: err };
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map