import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): any;
    findAll(skip?: number, take?: number): any;
    findBySlug(slug: string): any;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
