import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiProperty({
    description: 'Identificador único del producto a actualizar',
    example: 'prod-123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Nueva cantidad del producto en el carrito',
    example: 3,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
