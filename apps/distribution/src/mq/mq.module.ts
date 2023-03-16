import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { rabbitmqFactory } from '../config/rabbitmq.config';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionConsumer } from './consumers/distribution-consumer/distribution-consumer';
import { SubscriptionConsumer } from './consumers/subscription-consumer/subscription-consumer';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: rabbitmqFactory,
    }),
    BullModule.registerQueueAsync({
      // Note: BullModule throws an error when using the ConfigModule to retrieve
      //       the notification queue name from the environment. 
      name: process.env.BULLMQ_NOTIFICATION_QUEUE
    }),
    CommonModule,
    DistributionRuleModule,
  ],
  providers: [DistributionConsumer, SubscriptionConsumer],
  exports: [RabbitMQModule],
})
export class MqModule {}
