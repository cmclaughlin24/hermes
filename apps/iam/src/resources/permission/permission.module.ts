import { Module } from '@nestjs/common';
import { Permission } from './repository/entities/permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repository/permission.repository';
import { OrmPermissionRepository } from './repository/orm-permission.repository';
import { OrmDataSourceService } from '../../core/services/orm-data-source.service';

@Module({
  imports: [],
  providers: [
    PermissionResolver,
    PermissionService,
    {
      provide: PermissionRepository,
      inject: [OrmDataSourceService],
      useFactory: (dataSource: OrmDataSourceService) =>
        new OrmPermissionRepository(dataSource.getRepository(Permission)),
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
