export enum CartUserType {
  REGISTERED = 'registered',
  GUEST = 'guest',
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  total: number;
}
