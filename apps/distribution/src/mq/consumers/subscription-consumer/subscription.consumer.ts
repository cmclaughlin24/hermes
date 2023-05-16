import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DistributionLogService } from '../../../resources/distribution-log/distribution-log.service';
import { MqConsumer } from '../mq-consumer/mq.consumer';

@Injectable()
export class SubscriptionConsumer extends MqConsumer {
  constructor(
    protected readonly configService: ConfigService,
    protected readonly distributionLogService: DistributionLogService,
  ) {
    super(configService, distributionLogService);
  }
}
