import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestSessionDocument = GuestSession & Document;

@Schema({ collection: 'GUEST_SESSIONS', timestamps: true })
export class GuestSession {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const GuestSessionSchema = SchemaFactory.createForClass(GuestSession);

// Índice para búsquedas eficientes
GuestSessionSchema.index({ sessionId: 1 });
