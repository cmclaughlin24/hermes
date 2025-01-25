import { Module } from '@nestjs/common';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';
import { DistributionEvent } from './repository/entities/distribution-event.entity';
import { DistributionEventRepository } from './repository/distribution-event.repository';
import { OrmDistributionEventRepository } from './repository/orm-distribution-event.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionRule } from '../distribution-rule/repository/entities/distribution-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionEvent, DistributionRule])],
  controllers: [DistributionEventController],
  providers: [
    DistributionEventService,
    {
      provide: DistributionEventRepository,
      useClass: OrmDistributionEventRepository,
    },
  ],
  exports: [DistributionEventService],
})
export class DistributionEventModule {}
