import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({
    description: 'Identificador único del producto a añadir',
    example: 'prod-123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto a añadir',
    example: 2,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 29.99,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Producto Ejemplo',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
