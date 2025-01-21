import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';
import { DistributionEvent } from './repository/entities/distribution-event.entity';
import { DistributionEventRepository } from './repository/distribution-event.repository';
import { PostgresDistributionEventRepository } from './repository/postgres-distribution-event.repository';

@Module({
  imports: [SequelizeModule.forFeature([DistributionEvent])],
  controllers: [DistributionEventController],
  providers: [
    DistributionEventService,
    {
      provide: DistributionEventRepository,
      useClass: PostgresDistributionEventRepository,
    },
  ],
  exports: [DistributionEventService],
})
export class DistributionEventModule {}
