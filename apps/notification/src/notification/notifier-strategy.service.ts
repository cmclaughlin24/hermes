import { Injectable } from '@nestjs/common';
import { EmailStrategy } from './strategies/email.strategy';
import { CallStrategy } from './strategies/call.strategy';
import { SmsStrategy } from './strategies/sms.strategy';
import { PushNotificationStrategy } from './strategies/push-notification.strategy';
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
    [DeliveryMethods.PUSH]: this.pushNotificationStrategy,
  };

  constructor(
    private readonly smsStrategy: SmsStrategy,
    private readonly callStrategy: CallStrategy,
    private readonly emailStrategy: EmailStrategy,
    private readonly pushNotificationStrategy: PushNotificationStrategy,
  ) {}

  get(type: DeliveryMethods): NotifierStrategy<NotificationDto> {
    const strategy = this.strategies[type];

    if (!strategy) {
      throw new NotifierStrategyException(type);
    }

    return strategy;
  }
}
