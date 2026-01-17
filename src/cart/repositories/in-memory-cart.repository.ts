import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartUserType } from '../../common/interfaces/cart.interface';
import { ICartRepository } from './cart.repository.interface';

@Injectable()
export class InMemoryCartRepository implements ICartRepository {
  private carts: Map<string, Cart> = new Map();

  async create(
    userId: string | null,
    guestId: string | null,
    userType: CartUserType,
  ): Promise<Cart> {
    const cart: Cart = {
      id: uuidv4(),
      userId: userId || undefined,
      guestId: guestId || undefined,
      userType,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.carts.set(cart.id, cart);
    return cart;
  }

  async findById(cartId: string): Promise<Cart | null> {
    return this.carts.get(cartId) || null;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (cart.userId === userId && cart.userType === CartUserType.REGISTERED) {
        return cart;
      }
    }
    return null;
  }

  async findByGuestId(guestId: string): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (cart.guestId === guestId && cart.userType === CartUserType.GUEST) {
        return cart;
      }
    }
    return null;
  }

  async update(cart: Cart): Promise<Cart> {
    const existingCart = this.carts.get(cart.id);
    if (!existingCart) {
      throw new Error(`Cart with id ${cart.id} not found`);
    }

    const updatedCart: Cart = {
      ...cart,
      updatedAt: new Date(),
    };

    this.carts.set(cart.id, updatedCart);
    return updatedCart;
  }

  async delete(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
