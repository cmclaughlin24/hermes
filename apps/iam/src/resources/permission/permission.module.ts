import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './repository/entities/permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repository/permission.repository';
import { PostgresPermissionRepository } from './repository/postgres-permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [
    PermissionResolver,
    PermissionService,
    {
      provide: PermissionRepository,
      useClass: PostgresPermissionRepository,
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
