import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
