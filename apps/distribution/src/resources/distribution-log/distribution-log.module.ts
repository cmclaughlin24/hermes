import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

@Module({
  imports: [SequelizeModule.forFeature([DistributionLog, DistributionAttempt])],
  controllers: [DistributionLogController],
  providers: [DistributionLogService],
  exports: [DistributionLogService],
})
export class DistributionLogModule {}
