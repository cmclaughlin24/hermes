import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { PermissionModule } from '../permission/permission.module';
import { DeliveryWindow } from './entities/delivery-window.entity';
import { User } from './entities/user.entity';
import { UserDeliveryWindowResolver } from './resolvers/user-delivery-window.resolver';
import { UserPermissionResolver } from './resolvers/user-permission.resolver';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryWindow]),
    CommonModule,
    PermissionModule,
  ],
  providers: [
    UserResolver,
    UserService,
    UserPermissionResolver,
    UserDeliveryWindowResolver,
  ],
  exports: [UserService],
})
export class UserModule {}
