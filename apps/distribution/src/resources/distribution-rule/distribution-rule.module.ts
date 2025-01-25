import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { DistributionRule } from './repository/entities/distribution-rule.entity';
import { DistributionRuleRepository } from './repository/distribution-rule.repository';
import { OrmDistributionRuleRepository } from './repository/orm-distribution-rule.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DistributionRule]),
    DistributionEventModule,
  ],
  controllers: [DistributionRuleController],
  providers: [
    DistributionRuleService,
    {
      provide: DistributionRuleRepository,
      useClass: OrmDistributionRuleRepository,
    },
  ],
  exports: [DistributionRuleService, TypeOrmModule],
})
export class DistributionRuleModule {}
