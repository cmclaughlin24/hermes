import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Permission } from './repository/entities/permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repository/permission.repository';
import { OrmPermissionRepository } from './repository/orm-permission.repository';
import { DATA_SOURCE } from '../../core/core.module';

@Module({
  imports: [],
  providers: [
    PermissionResolver,
    PermissionService,
    {
      provide: PermissionRepository,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) =>
        new OrmPermissionRepository(dataSource.getRepository(Permission)),
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
