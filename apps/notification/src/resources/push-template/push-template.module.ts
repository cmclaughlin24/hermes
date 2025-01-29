import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { OrmDataSourceService } from '../../core/services/orm-data-source.service';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';
import { PushTemplate } from './repository/entities/push-template.entity';
import { PushAction } from './repository/entities/push-action.entity';
import { PushTemplateRepository } from './repository/push-template.repository';
import { OrmPushTemplateRepository } from './repository/orm-push-template.repository';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [PushTemplateController],
  providers: [
    PushTemplateService,
    {
      provide: PushTemplateRepository,
      inject: [OrmDataSourceService],
      useFactory: (dataSource: OrmDataSourceService) =>
        new OrmPushTemplateRepository(
          dataSource.getRepository(PushTemplate),
          dataSource.getRepository(PushAction),
        ),
    },
  ],
  exports: [PushTemplateService],
})
export class PushTemplateModule {}
