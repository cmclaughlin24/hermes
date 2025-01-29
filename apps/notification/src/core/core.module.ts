import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrmDataSourceService } from './services/orm-data-source.service';

@Global()
@Module({
  providers: [
    {
      provide: OrmDataSourceService,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        await new OrmDataSourceService(configService).initialize(),
    },
  ],
  exports: [OrmDataSourceService],
})
export class CoreModule {}
