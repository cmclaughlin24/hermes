import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './repository/entities/permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repository/permission.repository';
import { OrmPermissionRepository } from './repository/orm-permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [
    PermissionResolver,
    PermissionService,
    {
      provide: PermissionRepository,
      useClass: OrmPermissionRepository,
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
