import { Cart, CartUserType } from '../../common/interfaces/cart.interface';

export interface ICartRepository {
  create(userId: string | null, guestId: string | null, userType: CartUserType): Promise<Cart>;
  findById(cartId: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;
  findByGuestId(guestId: string): Promise<Cart | null>;
  update(cart: Cart): Promise<Cart>;
  delete(cartId: string): Promise<void>;
}
