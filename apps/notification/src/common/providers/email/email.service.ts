import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import { EmailTemplateService } from '../../../resources/email-template/email-template.service';
import { CreateEmailNotificationDto } from '../../dto/create-email-notification.dto';
import { CreateNotificationDto } from '../../interfaces/create-notification-dto.interface';

@Injectable()
export class EmailService implements CreateNotificationDto {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async sendEmail(createEmailNotification: CreateEmailNotificationDto) {
    return this.mailerService.sendMail({
      ...createEmailNotification,
      from:
        createEmailNotification.from || this.configService.get('MAILER_SENDER'),
    });
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
    createEmailNotificationDto.timeZone = data.timeZone;
    createEmailNotificationDto.subject = data.subject;
    createEmailNotificationDto.text = data.text;
    createEmailNotificationDto.template = data.template;
    createEmailNotificationDto.html = data.html;
    createEmailNotificationDto.context = data.context;

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

  async createEmailTemplate(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ) {
    const templateName = createEmailNotificationDto.template;
    let html = createEmailNotificationDto.html;
    let subject = createEmailNotificationDto.subject;

    if (templateName) {
      html &&
        this.logger.warn(
          `[${this.createEmailTemplate.name}] ${CreateEmailNotificationDto.name} contains both 'html' and 'template' keys, defaulting to 'template' key`,
        );

      const emailTemplate = await this.emailTemplateService.findOne(
        createEmailNotificationDto.template,
      );

      subject = emailTemplate.subject;
      html = emailTemplate.template;
    }

    if (!html) {
      throw new Error(
        `Invalid Argument: ${CreateEmailNotificationDto.name} must have either 'html' or 'template' keys present`,
      );
    }

    const htmlTemplate = Handlebars.compile(html);
    const textTemplate = Handlebars.compile(createEmailNotificationDto.text);
    const context = {
      timeZone: createEmailNotificationDto.timeZone,
      ...createEmailNotificationDto.context,
    };

    createEmailNotificationDto.subject = textTemplate(context);
    createEmailNotificationDto.html = htmlTemplate(context);
    delete createEmailNotificationDto.template;
    delete createEmailNotificationDto.context;

    return createEmailNotificationDto;
  }
}
