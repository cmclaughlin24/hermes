import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { PermissionModule } from '../permission/permission.module';
import { UserDeliveryWindowLoader } from './data-loaders/user-delivery-window.loader';
import { UserPermissionLoader } from './data-loaders/user-permission.loader';
import { DeliveryWindow } from './repository//entities/delivery-window.entity';
import { User } from './repository/entities/user.entity';
import { UserDeliveryWindowResolver } from './resolvers/user-delivery-window.resolver';
import { UserPermissionResolver } from './resolvers/user-permission.resolver';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { PostgresUserRepository } from './repository/postgres-user.repository';

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
    UserDeliveryWindowLoader,
    UserPermissionLoader,
    {
      provide: UserRepository,
      useClass: PostgresUserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
