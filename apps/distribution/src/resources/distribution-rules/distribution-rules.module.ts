import { Module } from '@nestjs/common';
import { DistributionRulesService } from './distribution-rules.service';
import { DistributionRulesController } from './distribution-rules.controller';

@Module({
  controllers: [DistributionRulesController],
  providers: [DistributionRulesService]
})
export class DistributionRulesModule {}
