import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergeCartDto {
  @ApiProperty({
    description: 'Identificador de sesión del carrito de invitado a fusionar',
    example: '2fa6708506a3ee01ab55f669b79eab60832ec7853043b080f84fda84770b7632',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  guestSessionId: string;
}
