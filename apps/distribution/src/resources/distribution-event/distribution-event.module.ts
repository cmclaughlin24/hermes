import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';
import { DistributionEvent } from './entities/distribution-event.entity';

@Module({
  imports: [SequelizeModule.forFeature([DistributionEvent])],
  controllers: [DistributionEventController],
  providers: [DistributionEventService]
})
export class DistributionEventModule {}
