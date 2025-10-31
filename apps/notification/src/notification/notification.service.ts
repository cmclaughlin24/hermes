import { DeliveryMethods } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from './dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { NotifierStrategyService } from './notifier-strategy.service';
import { NotificationDto } from './interfaces/notification-dto.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly notifierStrategies: NotifierStrategyService) {}

  /**
   * Sends an email notification.
   * @param {CreateEmailNotificationDto} createEmailNotificationDto
   * @returns {Promise<SentMessageInfo>}
   */
  async createEmailNotification(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    return this._notify(DeliveryMethods.EMAIL, createEmailNotificationDto);
  }

  /**
   * Sends a SMS notification.
   * @param {CreatePhoneNotificationDto} createTextNotification
   * @returns {Promise<MessageInstance>}
   */
  async createTextNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    return this._notify(DeliveryMethods.SMS, createPhoneNotificationDto);
  }

  /**
   * Sends a call notification.
   * @param {CreatePhoneNotificationDto} createPhoneNotificationDto
   * @returns {Promise<CallInstance>}
   */
  async createCallNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    return this._notify(DeliveryMethods.CALL, createPhoneNotificationDto);
  }

  /**
   * Sends a push notification.
   * @param {CreatePushNotificationDto} createPhoneNotificationDto
   * @returns {Promise<any>}
   */
  async createPushNotification(
    createPushNotificationDto: CreatePushNotificationDto,
  ) {
    return this._notify(DeliveryMethods.PUSH, createPushNotificationDto);
  }

  private async _notify(
    type: DeliveryMethods,
    notificationDto: NotificationDto,
  ) {
    const strategy = this.notifierStrategies.get(type);
    const dto = await strategy.createTemplate(notificationDto);
    return strategy.notify(dto);
  }
}
