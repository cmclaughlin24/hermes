import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
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
    HttpModule,
    DistributionRuleModule,
  ],
  providers: [DistributionDefaultConsumer],
})
export class ConsumersModule {}
