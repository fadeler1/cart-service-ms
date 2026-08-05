export enum CartUserType {
  REGISTERED = 'registered',
  GUEST = 'guest',
}

export type CartStatus = 'active' | 'completed';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Cart {
  id: string;
  userId?: string;
  guestId?: string;
  userType: CartUserType;
  items: CartItem[];
  status?: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  total: number;
}
