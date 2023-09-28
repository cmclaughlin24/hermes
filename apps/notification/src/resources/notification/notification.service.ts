import { DeliveryMethods } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { EmailService } from '../../common/services/email/email.service';
import { PhoneService } from '../../common/services/phone/phone.service';
import { PushNotificationService } from '../../common/services/push-notification/push-notification.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Sends an email notification.
   * @param {CreateEmailNotificationDto} createEmailNotificationDto
   * @returns {Promise<SentMessageInfo>}
   */
  async createEmailNotification(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    const emailNotificationDto = await this.emailService.createEmailTemplate(
      createEmailNotificationDto,
    );

    return this.emailService.sendEmail(emailNotificationDto);
  }

  /**
   * Sends a SMS notification.
   * @param {CreatePhoneNotificationDto} createTextNotification
   * @returns {Promise<MessageInstance>}
   */
  async createTextNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    const phoneNotificationDto = await this.phoneService.createPhoneTemplate(
      DeliveryMethods.SMS,
      createPhoneNotificationDto,
    );

    return this.phoneService.sendText(phoneNotificationDto);
  }

  /**
   * Sends a call notification.
   * @param {CreatePhoneNotificationDto} createPhoneNotificationDto
   * @returns {Promise<CallInstance>}
   */
  async createCallNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    const phoneNotificationDto = await this.phoneService.createPhoneTemplate(
      DeliveryMethods.CALL,
      createPhoneNotificationDto,
    );

    return this.phoneService.sendCall(phoneNotificationDto);
  }

  /**
   * Sends a push notification.
   * @param {CreatePushNotificationDto} createPhoneNotificationDto
   * @returns {Promise<any>}
   */
  async createPushNotification(
    createPushNotificationDto: CreatePushNotificationDto,
  ) {
    const pushNotificationDto =
      await this.pushNotificationService.createPushNotificationTemplate(
        createPushNotificationDto,
      );

    return this.pushNotificationService.sendPushNotification(
      pushNotificationDto,
    );
  }
}
