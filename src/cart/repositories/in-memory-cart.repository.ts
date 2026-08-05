import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartStatus, CartUserType } from '../../common/interfaces/cart.interface';
import { ICartRepository } from './cart.repository.interface';

@Injectable()
export class InMemoryCartRepository implements ICartRepository {
  private carts: Map<string, Cart & { status: CartStatus }> = new Map();

  async create(
    userId: string | null,
    guestId: string | null,
    userType: CartUserType,
  ): Promise<Cart> {
    const cart: Cart & { status: CartStatus } = {
      id: uuidv4(),
      userId: userId || undefined,
      guestId: guestId || undefined,
      userType,
      items: [],
      status: 'active',
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
      if (
        cart.userId === userId &&
        cart.userType === CartUserType.REGISTERED &&
        cart.status === 'active'
      ) {
        return cart;
      }
    }
    return null;
  }

  async findByGuestId(guestId: string): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (
        cart.guestId === guestId &&
        cart.userType === CartUserType.GUEST &&
        cart.status === 'active'
      ) {
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

    const updatedCart: Cart & { status: CartStatus } = {
      ...existingCart,
      ...cart,
      status: (cart.status as CartStatus) || existingCart.status || 'active',
      updatedAt: new Date(),
    };

    this.carts.set(cart.id, updatedCart);
    return updatedCart;
  }

  async updateStatus(cartId: string, status: 'active' | 'completed'): Promise<void> {
    const existingCart = this.carts.get(cartId);
    if (!existingCart) {
      throw new Error(`Cart with id ${cartId} not found`);
    }
    existingCart.status = status;
    existingCart.updatedAt = new Date();
    this.carts.set(cartId, existingCart);
  }

  async delete(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
