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
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    createPhoneNotificationDto.body = compileTextTemplate(
      createPhoneNotificationDto.body,
      createPhoneNotificationDto.context,
    );

    const result = await this.phoneService.sendText(createPhoneNotificationDto);

    return new ApiResponseDto(
      `Successfully sent SMS with body ${createPhoneNotificationDto.body} to ${createPhoneNotificationDto.to}`,
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
    const result = await this.phoneService.sendCall(createPhoneNotificationDto);

    return new ApiResponseDto(
      `Successfully made call with to ${createPhoneNotificationDto.to}`,
      result,
    );
  }
}
