import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DistributionQueues, NotificationQueues } from '@notification/common';
import { DistributionDefaultConsumer } from './distribution-default-consumer/distribution-default.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NotificationQueues.DEFAULT,
    }),
    BullModule.registerQueue({
      name: DistributionQueues.DEFAULT,
    }),
  ],
  providers: [DistributionDefaultConsumer],
})
export class ConsumersModule {}
