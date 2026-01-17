import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { CartUserType } from '../../common/interfaces/cart.interface';

export type CartDocument = Cart & Document;

@Schema({ collection: 'CART', timestamps: true })
export class Cart {
  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  userId?: string | mongoose.Types.ObjectId;

  @Prop({ required: false })
  guestSessionId?: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Índices para búsquedas eficientes
CartSchema.index({ userId: 1 });
CartSchema.index({ guestSessionId: 1 });
CartSchema.index({ status: 1 });
