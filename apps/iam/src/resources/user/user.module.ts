import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { PermissionModule } from '../permission/permission.module';
import { User } from './entities/user.entity';
import { UserPermissionResolver } from './resolvers/user-permission.resolver';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonModule, PermissionModule],
  providers: [UserResolver, UserService, UserPermissionResolver],
  exports: [UserService],
})
export class UserModule {}
