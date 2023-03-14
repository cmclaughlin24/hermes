import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DistributionQueues } from '@notification/common';
import { MqModule } from '../../mq/mq.module';
import { DistributionJobController } from './distribution-job.controller';
import { DistributionJobService } from './distribution-job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DistributionQueues.DISTRIBUTE,
    }),
    BullModule.registerQueue({
      name: 'distribution_subscription',
    }),
    MqModule
  ],
  controllers: [DistributionJobController],
  providers: [DistributionJobService],
})
export class DistributionJobModule {}
