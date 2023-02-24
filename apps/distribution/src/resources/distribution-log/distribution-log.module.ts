import { Module } from '@nestjs/common';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';

@Module({
  controllers: [DistributionLogController],
  providers: [DistributionLogService],
  exports: [DistributionLogService],
})
export class DistributionLogModule {}
