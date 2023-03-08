import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DistributionQueues } from '@notification/common';
import { DistributionJobController } from './distribution-job.controller';
import { DistributionJobService } from './distribution-job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DistributionQueues.DEFAULT,
    }),
    BullModule.registerQueue({
      name: 'distribution_subscription'
    })
  ],
  controllers: [DistributionJobController],
  providers: [DistributionJobService],
})
export class DistributionJobModule {}
