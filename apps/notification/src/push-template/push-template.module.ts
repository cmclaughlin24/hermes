import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheFactory } from '../config/cache.config';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushTemplateEntity } from './repository/entities/push-template.entity';
import { PushActionEntity } from './repository/entities/push-action.entity';
import { PushTemplateRepository } from './repository/push-template.repository';
import { OrmPushTemplateRepository } from './repository/orm-push-template.repository';
import { PushActionProfile } from './profiles/push-action.profile';
import { PushTemplateProfile } from './profiles/push-template.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTemplateEntity, PushActionEntity]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  controllers: [PushTemplateController],
  providers: [
    PushTemplateService,
    PushActionProfile,
    PushTemplateProfile,
    {
      provide: PushTemplateRepository,
      useClass: OrmPushTemplateRepository,
    },
  ],
  exports: [PushTemplateService],
})
export class PushTemplateModule {}
