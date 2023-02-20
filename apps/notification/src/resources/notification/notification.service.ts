import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreateRadioNotificationDto } from '../../common/dto/create-radio-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { RadioService } from '../../common/providers/radio/radio.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
    private readonly radioService: RadioService,
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
    const result = await this.phoneService.sendText(createTextNotification);

    return new ApiResponseDto(
      `Successfully sent SMS with body ${createTextNotification.body} to ${createTextNotification.to}`,
      result,
    );
  }

  /**
   * Sends a radio notification.
   * @param createRadioNotification 
   * @returns {Promise<ApiResponseDto>}
   */
  async createRadioNotification(
    createRadioNotification: CreateRadioNotificationDto,
  ) {
    // Todo: Call RadioService to directly send a notification.
  }
}
