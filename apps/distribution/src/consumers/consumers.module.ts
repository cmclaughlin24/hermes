import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DistributionDefaultConsumer } from './distribution-default-consumer/distribution-default.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    BullModule.registerQueue({
      name: 'distribution_default',
    }),
  ],
  providers: [DistributionDefaultConsumer],
})
export class ConsumersModule {}
