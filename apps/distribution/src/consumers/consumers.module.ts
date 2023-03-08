import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
import { CommonModule } from '../common/common.module';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionDefaultConsumer } from './distribution-default-consumer/distribution-default.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NotificationQueues.DEFAULT,
    }),
    BullModule.registerQueue({
      name: DistributionQueues.DEFAULT,
    }),
    BullModule.registerQueue({
      name: 'distribution_subscription',
    }),
    DistributionRuleModule,
    CommonModule,
  ],
  providers: [DistributionDefaultConsumer],
})
export class ConsumersModule {}
