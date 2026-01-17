import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({
    description: 'Identificador único del producto',
    example: 'prod-123',
  })
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto en el carrito',
    example: 2,
    minimum: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 29.99,
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Producto Ejemplo',
  })
  name: string;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Identificador único del carrito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  cartId: string;

  @ApiProperty({
    description: 'Lista de productos en el carrito',
    type: [CartItemDto],
  })
  items: CartItemDto[];

  @ApiProperty({
    description: 'Total del carrito (suma de todos los productos)',
    example: 59.98,
    minimum: 0,
  })
  total: number;
}
