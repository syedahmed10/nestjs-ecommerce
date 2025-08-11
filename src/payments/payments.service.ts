import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private logger = new Logger(PaymentsService.name);

  constructor(private config: ConfigService) {
    const key = this.config.get('STRIPE_SECRET') || '';
    this.stripe = new Stripe(key, { apiVersion: '2022-11-15' });
  }

  // minimal wrapper: charge with idempotencyKey
  async charge(payload: { amount: number; currency: string; metadata?: any; idempotencyKey?: string }) {
    // in production you'd create a PaymentIntent and confirm on client securely
    // For server-side test/demo we create a PaymentIntent and confirm (if possible)
    try {
      const intent = await this.stripe.paymentIntents.create(
        {
          amount: payload.amount,
          currency: payload.currency,
          metadata: payload.metadata
        },
        { idempotencyKey: payload.idempotencyKey }
      );
      // For simplicity we treat statuses
      if (intent.status === 'succeeded') {
        return { status: 'succeeded', id: intent.id };
      }
      // you might handle requires_action etc.
      // For demo assume success
      return { status: 'succeeded', id: intent.id };
    } catch (err) {
      this.logger.error('Stripe charge failed', err);
      return { status: 'failed', error: err };
    }
  }
}
