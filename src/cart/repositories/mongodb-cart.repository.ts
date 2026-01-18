import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Cart as CartInterface, CartUserType } from '../../common/interfaces/cart.interface';
import { ICartRepository } from './cart.repository.interface';

@Injectable()
export class MongoDBCartRepository implements ICartRepository {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  private toCartInterface(cartDoc: CartDocument, userType?: CartUserType): CartInterface {
    // Determinar el userType basado en qué campos tiene el documento
    let determinedUserType = userType;
    
    if (!determinedUserType) {
      // Si tiene userId, es registrado; si tiene guestSessionId, es invitado
      determinedUserType = cartDoc.userId ? CartUserType.REGISTERED : CartUserType.GUEST;
    }

    // Convertir userId de ObjectId a string si es necesario
    const userIdStr = cartDoc.userId 
      ? (cartDoc.userId.toString ? cartDoc.userId.toString() : String(cartDoc.userId))
      : undefined;

    return {
      id: cartDoc._id.toString(),
      userId: determinedUserType === CartUserType.REGISTERED ? userIdStr : undefined,
      guestId: determinedUserType === CartUserType.GUEST ? cartDoc.guestSessionId : undefined,
      userType: determinedUserType,
      items: cartDoc.items || [],
      createdAt: cartDoc.createdAt || new Date(),
      updatedAt: cartDoc.updatedAt || new Date(),
    };
  }

  async create(
    userId: string | null,
    guestId: string | null,
    userType: CartUserType,
  ): Promise<CartInterface> {
    const cartData: Partial<Cart> = {
      items: [],
      status: 'active',
    };

    // Si es usuario registrado, usar userId; si es invitado, usar guestSessionId
    if (userType === CartUserType.REGISTERED && userId) {
      cartData.userId = userId;
    } else if (userType === CartUserType.GUEST && guestId) {
      cartData.guestSessionId = guestId;
    }

    const cartDoc = await this.cartModel.create(cartData);
    return this.toCartInterface(cartDoc, userType);
  }

  async findById(cartId: string): Promise<CartInterface | null> {
    const cartDoc = await this.cartModel.findById(cartId).exec();
    return cartDoc ? this.toCartInterface(cartDoc) : null;
  }

  async findByUserId(userId: string): Promise<CartInterface | null> {
    // Para usuarios registrados, buscar por userId (puede ser ObjectId o string)
    // Intentar primero como ObjectId, si falla, buscar como string
    let cartDoc: CartDocument | null = null;
    
    // Intentar buscar como ObjectId si el userId es válido ObjectId
    if (Types.ObjectId.isValid(userId)) {
      cartDoc = await this.cartModel
        .findOne({
          userId: new Types.ObjectId(userId),
          status: 'active',
        })
        .exec();
    }
    
    // Si no se encontró, intentar como string
    if (!cartDoc) {
      cartDoc = await this.cartModel
        .findOne({
          userId: userId,
          status: 'active',
        })
        .exec();
    }

    return cartDoc ? this.toCartInterface(cartDoc, CartUserType.REGISTERED) : null;
  }

  async findByGuestId(guestId: string): Promise<CartInterface | null> {
    // Buscar por guestSessionId exacto
    const cartDoc = await this.cartModel
      .findOne({
        guestSessionId: guestId,
        status: 'active',
      })
      .exec();

    // Si no se encuentra, intentar sin el filtro de status (por si acaso)
    if (!cartDoc) {
      const cartDocWithoutStatus = await this.cartModel
        .findOne({
          guestSessionId: guestId,
        })
        .exec();
      
      if (cartDocWithoutStatus) {
        return this.toCartInterface(cartDocWithoutStatus, CartUserType.GUEST);
      }
    }

    return cartDoc ? this.toCartInterface(cartDoc, CartUserType.GUEST) : null;
  }

  async update(cart: CartInterface): Promise<CartInterface> {
    const { id, userId, guestId, userType, ...updateData } = cart;
    
    // Mapear de vuelta a la estructura de MongoDB según el tipo de usuario
    const updateDataMongo: any = {
      items: cart.items,
      status: 'active', // Mantener status activo
      updatedAt: new Date(),
    };

    // Si es usuario registrado, actualizar userId; si es invitado, actualizar guestSessionId
    if (userType === CartUserType.REGISTERED && userId) {
      // Intentar convertir a ObjectId si es válido
      if (Types.ObjectId.isValid(userId)) {
        updateDataMongo.userId = new Types.ObjectId(userId);
      } else {
        updateDataMongo.userId = userId;
      }
      updateDataMongo.guestSessionId = undefined; // Limpiar guestSessionId si existe
    } else if (userType === CartUserType.GUEST && guestId) {
      updateDataMongo.guestSessionId = guestId;
      updateDataMongo.userId = undefined; // Limpiar userId si existe
    }
    
    const cartDoc = await this.cartModel
      .findByIdAndUpdate(
        id,
        updateDataMongo,
        { new: true },
      )
      .exec();

    if (!cartDoc) {
      throw new Error(`Cart with id ${id} not found`);
    }

    return this.toCartInterface(cartDoc, userType);
  }

  async delete(cartId: string): Promise<void> {
    await this.cartModel.findByIdAndDelete(cartId).exec();
  }
}
