import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';
import { DistributionLog } from './entities/distribution-log.entity';

@Module({
  imports: [SequelizeModule.forFeature([DistributionLog])],
  controllers: [DistributionLogController],
  providers: [DistributionLogService],
  exports: [DistributionLogService],
})
export class DistributionLogModule {}
