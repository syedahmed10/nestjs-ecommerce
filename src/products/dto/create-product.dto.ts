import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  stock: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
