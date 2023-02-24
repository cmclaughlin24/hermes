import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { DistributionRule } from './entities/distribution-rule.entity';

@Module({
  imports: [SequelizeModule.forFeature([DistributionRule])],
  controllers: [DistributionRuleController],
  providers: [DistributionRuleService],
  exports: [DistributionRuleService],
})
export class DistributionRuleModule {}
