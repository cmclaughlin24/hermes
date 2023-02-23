import { Module } from '@nestjs/common';
import { DistributionLogService } from './distribution-log.service';
import { DistributionLogController } from './distribution-log.controller';

@Module({
  controllers: [DistributionLogController],
  providers: [DistributionLogService]
})
export class DistributionLogModule {}
