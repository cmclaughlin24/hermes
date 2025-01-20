import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../../config/cache.config';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushTemplate } from './repository/entities/push-template.entity';
import { PushAction } from './repository/entities/push-action.entity';
import { PushTemplateRepository } from './repository/push-template.repository';
import { PostgresPushTemplateRepository } from './repository/postgres-push-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTemplate, PushAction]),
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
      useClass: PostgresPushTemplateRepository,
    },
  ],
  exports: [PushTemplateService],
})
export class PushTemplateModule {}
