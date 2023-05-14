import { Injectable } from '@nestjs/common';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
  ) {}

  /**
   * Sends an email notification.
   * @param {CreateEmailNotificationDto} createEmailNotificationDto
   * @returns {Promise<ApiResponseDto>}
   */
  async createEmailNotification(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    const emailNotificationDto = await this.emailService.createEmailTemplate(
      createEmailNotificationDto,
    );

    const result = await this.emailService.sendEmail(emailNotificationDto);

    return new ApiResponseDto(
      `Successfully sent email with subject ${createEmailNotificationDto.subject} to ${createEmailNotificationDto.to}`,
      result,
    );
  }

  /**
   * Sends a SMS notification.
   * @param {CreatePhoneNotificationDto} createTextNotification
   * @returns {Promise<ApiResponseDto>}
   */
  async createTextNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    const phoneNotificationDto = await this.phoneService.createPhoneTemplate(
      DeliveryMethods.SMS,
      createPhoneNotificationDto,
    );

    const result = await this.phoneService.sendText(phoneNotificationDto);

    return new ApiResponseDto(
      `Successfully sent SMS with body ${phoneNotificationDto.body} to ${phoneNotificationDto.to}`,
      result,
    );
  }

  /**
   * Sends a call notification.
   * @param createPhoneNotificationDto
   * @returns {Promise<ApiResponseDto>}
   */
  async createCallNotification(
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    const phoneNotificationDto = await this.phoneService.createPhoneTemplate(
      DeliveryMethods.CALL,
      createPhoneNotificationDto,
    );

    const result = await this.phoneService.sendCall(phoneNotificationDto);

    return new ApiResponseDto(
      `Successfully made call with to ${phoneNotificationDto.to}`,
      result,
    );
  }
}
