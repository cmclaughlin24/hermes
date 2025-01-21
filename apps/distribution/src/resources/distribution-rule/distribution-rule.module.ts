import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { DistributionRule } from './repository/entities/distribution-rule.entity';
import { DistributionRuleRepository } from './repository/distribution-rule.repository';
import { PostgresDistributionRuleRepository } from './repository/postgres-distribution-rule.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([DistributionRule]),
    DistributionEventModule,
  ],
  controllers: [DistributionRuleController],
  providers: [
    DistributionRuleService,
    {
      provide: DistributionRuleRepository,
      useClass: PostgresDistributionRuleRepository,
    },
  ],
  exports: [DistributionRuleService],
})
export class DistributionRuleModule {}
