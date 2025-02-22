import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullMQOtel } from 'bullmq-otel';
import { CommonModule } from '../common/common.module';
import { rabbitmqFactory } from '../config/rabbitmq.config';
import { DistributionEventModule } from '../resources/distribution-event/distribution-event.module';
import { DistributionLogModule } from '../resources/distribution-log/distribution-log.module';
import { SubscriptionModule } from '../resources/subscription/subscription.module';
import { DistributionConsumer } from './consumers/distribution-consumer/distribution.consumer';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: rabbitmqFactory,
    }),
    BullModule.registerQueue({
      // Note: BullModule throws an error when using the ConfigModule to retrieve
      //       the notification queue name from the environment.
      name: process.env.BULLMQ_NOTIFICATION_QUEUE,
      // Note: Bullmq requires the prefix option as a cluster "hash tag". See
      //       https://docs.bullmq.io/bull/patterns/redis-cluster for more information.
      prefix: process.env.BULLMQ_NOTIFICATION_QUEUE_PREFIX,
      telemetry: new BullMQOtel(process.env.BULLMQ_NOTIFICATION_QUEUE),
    }),
    CommonModule,
    DistributionEventModule,
    DistributionLogModule,
    SubscriptionModule,
  ],
  providers: [DistributionConsumer],
  exports: [RabbitMQModule],
})
export class MqModule {}
