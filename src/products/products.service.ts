import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.product.create({ data });
  }

  findAll(skip = 0, take = 20) {
    return this.prisma.product.findMany({ skip, take });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({ where: { slug } });
  }

  async update(id: string, data: any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
