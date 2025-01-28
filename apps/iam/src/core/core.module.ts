import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CORE_MODULE_OPTIONS,
  CORE_MODULE_OPTIONS_TYPE,
  CoreModuleDefinitionClass,
} from './core.module-definition';
import { OrmDataSourceService } from './services/orm-data-source.service';
import { REQUEST } from '@nestjs/core';
import { TenantTokenService } from './services/tenant-token.service';

@Global()
@Module({
  providers: [
    {
      provide: OrmDataSourceService,
      scope: Scope.REQUEST,
      durable: true,
      inject: [CORE_MODULE_OPTIONS, ConfigService, REQUEST],
      useFactory: async (
        options: typeof CORE_MODULE_OPTIONS_TYPE,
        configService: ConfigService,
        request: { tenantId: string },
      ) =>
        await new OrmDataSourceService(options, configService).initialize(
          request.tenantId,
        ),
    },
    TenantTokenService,
  ],
  exports: [OrmDataSourceService, TenantTokenService],
})
export class CoreModule extends CoreModuleDefinitionClass {}
