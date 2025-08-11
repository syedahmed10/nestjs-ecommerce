import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private svc;
    constructor(svc: ProductsService);
    findAll(skip?: number, take?: number): any;
    findOne(slug: string): any;
    create(dto: CreateProductDto): any;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
