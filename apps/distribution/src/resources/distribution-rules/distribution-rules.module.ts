import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionRulesController } from './distribution-rules.controller';
import { DistributionRulesService } from './distribution-rules.service';
import { DistributionRule } from './entities/distribution-rule.entity';

@Module({
  imports: [SequelizeModule.forFeature([DistributionRule])],
  controllers: [DistributionRulesController],
  providers: [DistributionRulesService],
  exports: [DistributionRulesService],
})
export class DistributionRulesModule {}
