import { ConfigService } from '@nestjs/config';
export declare class PaymentsService {
    private config;
    private stripe;
    private logger;
    constructor(config: ConfigService);
    charge(payload: {
        amount: number;
        currency: string;
        metadata?: any;
        idempotencyKey?: string;
    }): Promise<{
        status: string;
        id: any;
        error?: undefined;
    } | {
        status: string;
        error: any;
        id?: undefined;
    }>;
}
