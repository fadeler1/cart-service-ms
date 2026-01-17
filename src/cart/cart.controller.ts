import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CartManagerService } from './services/cart-manager.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartManagerService: CartManagerService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener o crear carrito',
    description:
      'Obtiene el carrito del usuario actual. Si no existe, crea uno nuevo automáticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito obtenido o creado exitosamente',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido o faltante',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or missing JWT token',
      },
    },
  })
  async getCart(@CurrentUser() user: JwtPayload): Promise<CartResponseDto> {
    const cart = await this.cartManagerService.getOrCreateCart(user);
    return this.cartManagerService.formatCartResponse(cart);
  }

  @Get(':cartId')
  @ApiOperation({
    summary: 'Obtener carrito por ID',
    description: 'Obtiene un carrito específico validando que pertenezca al usuario actual.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Identificador único del carrito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
  @ApiNotFoundResponse({
    description: 'Carrito no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Carrito con id {cartId} no encontrado',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'El carrito no pertenece al usuario actual',
  })
  async getCartById(
    @Param('cartId') cartId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartResponseDto> {
    const cart = await this.cartManagerService.getCartById(cartId, user);
    return this.cartManagerService.formatCartResponse(cart);
  }

  @Post(':cartId/items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Añadir producto al carrito',
    description:
      'Añade un producto al carrito. Si el producto ya existe, incrementa su cantidad.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Identificador único del carrito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto añadido exitosamente al carrito',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
  @ApiNotFoundResponse({ description: 'Carrito no encontrado' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o carrito no pertenece al usuario',
  })
  async addItem(
    @Param('cartId') cartId: string,
    @Body() addItemDto: AddItemDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartResponseDto> {
    const cart = await this.cartManagerService.addItemToCart(cartId, user, addItemDto);
    return this.cartManagerService.formatCartResponse(cart);
  }

  @Put(':cartId/items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar cantidad de producto',
    description: 'Actualiza la cantidad de un producto específico en el carrito.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Identificador único del carrito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad actualizada exitosamente',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
  @ApiNotFoundResponse({
    description: 'Carrito o producto no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o carrito no pertenece al usuario',
  })
  async updateItemQuantity(
    @Param('cartId') cartId: string,
    @Body() updateItemDto: UpdateItemDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartResponseDto> {
    const cart = await this.cartManagerService.updateItemQuantity(cartId, user, updateItemDto);
    return this.cartManagerService.formatCartResponse(cart);
  }

  @Delete(':cartId/items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar producto del carrito',
    description: 'Elimina un producto del carrito completamente.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Identificador único del carrito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'productId',
    description: 'Identificador único del producto a eliminar',
    example: 'prod-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente del carrito',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
  @ApiNotFoundResponse({
    description: 'Carrito o producto no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Carrito no pertenece al usuario',
  })
  async removeItem(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartResponseDto> {
    const cart = await this.cartManagerService.removeItemFromCart(cartId, user, productId);
    return this.cartManagerService.formatCartResponse(cart);
  }
}
