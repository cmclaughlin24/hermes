import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CORE_MODULE_OPTIONS,
  CORE_MODULE_OPTIONS_TYPE,
  CoreModuleDefinitionClass,
} from './core.module-definition';
import { OrmDataSourceService } from './services/orm-data-source.service';

@Global()
@Module({
  providers: [
    {
      provide: OrmDataSourceService,
      inject: [CORE_MODULE_OPTIONS, ConfigService],
      useFactory: async (
        options: typeof CORE_MODULE_OPTIONS_TYPE,
        configService: ConfigService,
      ) => await new OrmDataSourceService(options, configService).initialize(),
    },
  ],
  exports: [OrmDataSourceService],
})
export class CoreModule extends CoreModuleDefinitionClass {}
