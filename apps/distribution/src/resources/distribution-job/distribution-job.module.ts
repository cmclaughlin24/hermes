import { Module } from '@nestjs/common';
import { DistributionJobService } from './distribution-job.service';
import { DistributionJobController } from './distribution-job.controller';

@Module({
  controllers: [DistributionJobController],
  providers: [DistributionJobService]
})
export class DistributionJobModule {}
