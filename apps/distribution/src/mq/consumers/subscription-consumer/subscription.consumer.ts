import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import { SubscriptionService } from 'apps/distribution/src/resources/subscription/subscription.service';
import { MqInterceptor } from '../../../common/interceptors/mq/mq.interceptor';
import { MqConsumer } from '../mq-consumer/mq.consumer';

@UseInterceptors(MqInterceptor)
@Injectable()
export class SubscriptionConsumer extends MqConsumer {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @RabbitSubscribe({
    queue: process.env.RABBITMQ_SUBSCRIPTION_QUEUE,
  })
  async subscribe(message: any, amqpMsg: ConsumeMessage) {
    try {
      const messageDto = await this.createMessageDto(message);
    } catch (error) {
      // Note: The MqInterceptor will be handled the error and determine if a message
      //       should be retried or not.
      throw error;
    }
  }
}
