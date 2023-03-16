import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionRuleModule } from '../distribution-rule/distribution-rule.module';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Subscription, SubscriptionFilter]),
    DistributionRuleModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
