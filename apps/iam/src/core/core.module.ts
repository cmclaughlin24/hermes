import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
      inject: [ConfigService, REQUEST],
      useFactory: async (
        configService: ConfigService,
        request: { tenantId: string },
      ) =>
        await new OrmDataSourceService(configService).initialize(
          request.tenantId,
        ),
    },
    TenantTokenService,
  ],
  exports: [OrmDataSourceService, TenantTokenService],
})
export class CoreModule {}
