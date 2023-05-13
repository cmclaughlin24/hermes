import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from '@notification/common';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { compileTextTemplate } from '../../common/utils/template.utils';

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
    createTextNotification: CreatePhoneNotificationDto,
  ) {
    createTextNotification.body = compileTextTemplate(
      createTextNotification.body,
      createTextNotification.context,
    );

    const result = await this.phoneService.sendText(createTextNotification);

    return new ApiResponseDto(
      `Successfully sent SMS with body ${createTextNotification.body} to ${createTextNotification.to}`,
      result,
    );
  }

  /**
   * Sends a call notification.
   * @param createCallNotification
   * @returns {Promise<ApiResponseDto>}
   */
  async createCallNotification(
    createCallNotification: CreatePhoneNotificationDto,
  ) {
    // Todo: Call PhoneService to directly send a notification.
  }
}
