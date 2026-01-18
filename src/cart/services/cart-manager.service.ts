import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ICartRepository } from '../repositories/cart.repository.interface';
import { Cart, CartItem, CartUserType, CartResponse } from '../../common/interfaces/cart.interface';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AddItemDto } from '../dto/add-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { GuestSession, GuestSessionDocument } from '../schemas/guest-session.schema';

@Injectable()
export class CartManagerService {
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @InjectModel(GuestSession.name) private guestSessionModel: Model<GuestSessionDocument>,
  ) {}

  async getOrCreateCart(user: JwtPayload): Promise<Cart> {
    const userType = user.type === 'guest' ? CartUserType.GUEST : CartUserType.REGISTERED;
    const userId = userType === CartUserType.REGISTERED ? user.sub : null;
    const guestId = userType === CartUserType.GUEST ? user.sub : null;

    let cart: Cart | null = null;

    if (userType === CartUserType.REGISTERED) {
      cart = await this.cartRepository.findByUserId(user.sub);
    } else {
      cart = await this.cartRepository.findByGuestId(user.sub);
    }

    if (!cart) {
      cart = await this.cartRepository.create(userId, guestId, userType);
    }

    return cart;
  }

  async getCartById(cartId: string, user: JwtPayload): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId);

    if (!cart) {
      throw new NotFoundException(`Carrito con id ${cartId} no encontrado`);
    }

    const userType = user.type === 'guest' ? CartUserType.GUEST : CartUserType.REGISTERED;
    const userId = userType === CartUserType.REGISTERED ? user.sub : null;
    const guestId = userType === CartUserType.GUEST ? user.sub : null;

    if (cart.userType !== userType) {
      throw new BadRequestException('El carrito no pertenece al tipo de usuario actual');
    }

    if (
      (userType === CartUserType.REGISTERED && cart.userId !== userId) ||
      (userType === CartUserType.GUEST && cart.guestId !== guestId)
    ) {
      throw new BadRequestException('El carrito no pertenece al usuario actual');
    }

    return cart;
  }

  async addItemToCart(cartId: string, user: JwtPayload, addItemDto: AddItemDto): Promise<Cart> {
    const cart = await this.getCartById(cartId, user);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === addItemDto.productId,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += addItemDto.quantity;
    } else {
      cart.items.push({
        productId: addItemDto.productId,
        quantity: addItemDto.quantity,
        price: addItemDto.price,
        name: addItemDto.name,
      });
    }

    return await this.cartRepository.update(cart);
  }

  async updateItemQuantity(
    cartId: string,
    user: JwtPayload,
    updateItemDto: UpdateItemDto,
  ): Promise<Cart> {
    const cart = await this.getCartById(cartId, user);

    const itemIndex = cart.items.findIndex((item) => item.productId === updateItemDto.productId);

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Producto con id ${updateItemDto.productId} no encontrado en el carrito`,
      );
    }

    cart.items[itemIndex].quantity = updateItemDto.quantity;

    return await this.cartRepository.update(cart);
  }

  async removeItemFromCart(cartId: string, user: JwtPayload, productId: string): Promise<Cart> {
    const cart = await this.getCartById(cartId, user);

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Producto con id ${productId} no encontrado en el carrito`);
    }

    cart.items.splice(itemIndex, 1);

    return await this.cartRepository.update(cart);
  }

  async mergeGuestCartIntoUserCart(
    userId: string,
    guestSessionId: string,
  ): Promise<Cart> {
    // Buscar carrito de invitado
    const guestCart = await this.cartRepository.findByGuestId(guestSessionId);
    
    // Si no se encuentra, lanzar excepción informativa
    if (!guestCart) {
      throw new NotFoundException(
        `Carrito de invitado con guestSessionId ${guestSessionId} no encontrado`,
      );
    }

    // Buscar o crear carrito del usuario registrado
    let userCart = await this.cartRepository.findByUserId(userId);

    if (!userCart) {
      // Si no existe carrito del usuario, crear uno nuevo
      userCart = await this.cartRepository.create(userId, null, CartUserType.REGISTERED);
    }

    // Si existe carrito de invitado con items, fusionar
    if (guestCart && guestCart.items.length > 0) {
      // Crear un mapa para fusionar items por productId
      const itemsMap = new Map<string, CartItem>();

      // Agregar items del carrito del usuario al mapa
      userCart.items.forEach((item) => {
        itemsMap.set(item.productId, { ...item });
      });

      // Fusionar items del carrito de invitado
      guestCart.items.forEach((guestItem) => {
        const existingItem = itemsMap.get(guestItem.productId);

        if (existingItem) {
          // Si el producto ya existe, sumar las cantidades
          existingItem.quantity += guestItem.quantity;
        } else {
          // Si es un producto nuevo, agregarlo
          itemsMap.set(guestItem.productId, { ...guestItem });
        }
      });

      // Convertir el mapa de vuelta a array
      userCart.items = Array.from(itemsMap.values());

      // Actualizar el carrito del usuario con los items fusionados
      userCart = await this.cartRepository.update(userCart);

      // Eliminar el carrito de invitado después de la fusión
      await this.cartRepository.delete(guestCart.id);
    } else if (guestCart) {
      // Si el carrito de invitado existe pero está vacío, solo eliminarlo
      await this.cartRepository.delete(guestCart.id);
    }

    // Eliminar la sesión de invitado de GUEST_SESSIONS
    await this.guestSessionModel.deleteOne({ sessionId: guestSessionId }).exec();

    return userCart;
  }

  formatCartResponse(cart: Cart): CartResponse {
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      cartId: cart.id,
      items: cart.items,
      total: Number(total.toFixed(2)),
    };
  }
}
