import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { CreateEmailNotificationDto } from '../../dto/create-email-notification.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(createEmailNotification: CreateEmailNotificationDto) {
    try {
      const result = await this.mailerService.sendMail({
        ...createEmailNotification,
        from:
          createEmailNotification.from ||
          this.configService.get('MAILER_SENDER'),
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createNotificationDto(data: any) {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const createEmailNotificationDto = new CreateEmailNotificationDto();
    createEmailNotificationDto.to = data.to;
    createEmailNotificationDto.from = data.from;
    createEmailNotificationDto.subject = data.subject;
    createEmailNotificationDto.text = data.text;

    try {
      await validateOrReject(createEmailNotificationDto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new Error(validationErrors);
    }

    return createEmailNotificationDto;
  }
}
