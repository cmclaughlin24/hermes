import { Injectable, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqLoggerInterceptor } from '../../../common/interceptors/mq-logger/mq-logger.interceptor';
import { MqConsumer } from '../mq-consumer/mq.consumer';

@UseInterceptors(MqLoggerInterceptor)
@Injectable()
export class SubscriptionConsumer extends MqConsumer {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }
}
