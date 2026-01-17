import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartManagerService } from './services/cart-manager.service';
import { MongoDBCartRepository } from './repositories/mongodb-cart.repository';
import { InMemoryCartRepository } from './repositories/in-memory-cart.repository';
import { ICartRepository } from './repositories/cart.repository.interface';
import { Cart, CartSchema } from './schemas/cart.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    AuthModule,
  ],
  controllers: [CartController],
  providers: [
    CartManagerService,
    {
      provide: 'ICartRepository',
      // Cambia a InMemoryCartRepository si quieres usar memoria en desarrollo
      useClass: MongoDBCartRepository,
    },
  ],
  exports: [CartManagerService],
})
export class CartModule {}
