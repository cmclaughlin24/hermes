import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { DistributionRule } from './repository/entities/distribution-rule.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([DistributionRule]),
    DistributionEventModule,
  ],
  controllers: [DistributionRuleController],
  providers: [DistributionRuleService],
  exports: [DistributionRuleService],
})
export class DistributionRuleModule {}
