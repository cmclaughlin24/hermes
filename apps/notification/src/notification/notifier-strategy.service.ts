import { Injectable } from '@nestjs/common';
import { EmailNotifierStrategy } from './strategies/email-notifier.strategy';
import { CallNotifierStrategy } from './strategies/call-notifier.strategy';
import { SmsNotifierStrategy } from './strategies/sms-notifier.strategy';
import { PushNotifierStrategy } from './strategies/push-notifier.strategy';
import { DeliveryMethods } from '@hermes/common';
import { NotificationDto } from './interfaces/notification-dto.interface';
import { NotifierStrategy } from './interfaces/notifier-strategy.interface';
import { NotifierStrategyException } from './errors/notifier-strategy.error';

@Injectable()
export class NotifierStrategyService {
  private readonly strategies: Record<
    DeliveryMethods,
    NotifierStrategy<NotificationDto>
  > = {
    [DeliveryMethods.SMS]: this.smsStrategy,
    [DeliveryMethods.CALL]: this.callStrategy,
    [DeliveryMethods.EMAIL]: this.emailStrategy,
    [DeliveryMethods.PUSH]: this.pushStrategy,
  };

  constructor(
    private readonly smsStrategy: SmsNotifierStrategy,
    private readonly callStrategy: CallNotifierStrategy,
    private readonly emailStrategy: EmailNotifierStrategy,
    private readonly pushStrategy: PushNotifierStrategy,
  ) {}

  get(type: DeliveryMethods): NotifierStrategy<NotificationDto> {
    const strategy = this.strategies[type];

    if (!strategy) {
      throw new NotifierStrategyException(type);
    }

    return strategy;
  }
}
