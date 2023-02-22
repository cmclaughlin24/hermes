import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DistributionConsumer } from './distribution-consumer/distribution.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'distribution_default',
    }),
  ],
  providers: [DistributionConsumer],
})
export class ConsumersModule {}
