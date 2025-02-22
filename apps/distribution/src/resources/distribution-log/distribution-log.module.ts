import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';
import { DistributionAttempt } from './repository/entities/distribution-attempt.entity';
import { DistributionLog } from './repository/entities/distribution-log.entity';
import { DistributionLogRepository } from './repository/distribution-log.repository';
import { OrmDistributionLogRepository } from './repository/orm-distribution-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionLog, DistributionAttempt])],
  controllers: [DistributionLogController],
  providers: [
    DistributionLogService,
    {
      provide: DistributionLogRepository,
      useClass: OrmDistributionLogRepository,
    },
  ],
  exports: [DistributionLogService],
})
export class DistributionLogModule {}
