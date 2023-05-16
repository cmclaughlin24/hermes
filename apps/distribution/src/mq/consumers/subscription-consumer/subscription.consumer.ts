import { Injectable, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqInterceptor } from '../../../common/interceptors/mq/mq.interceptor';
import { MqConsumer } from '../mq-consumer/mq.consumer';

@UseInterceptors(MqInterceptor)
@Injectable()
export class SubscriptionConsumer extends MqConsumer {
  constructor(private readonly configService: ConfigService) {
    super();
  }
}
