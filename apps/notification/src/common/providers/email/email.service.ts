import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import { EmailTemplateService } from '../../../resources/email-template/email-template.service';
import { CreateEmailNotificationDto } from '../../dto/create-email-notification.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  async sendEmail(createEmailNotification: CreateEmailNotificationDto) {
    try {
      const template = Handlebars.compile('<h1>{{title}}</h1>');

      const result = await this.mailerService.sendMail({
        ...createEmailNotification,
        from:
          createEmailNotification.from ||
          this.configService.get('MAILER_SENDER'),
        html: template({ title: 'Runtime template' })
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
