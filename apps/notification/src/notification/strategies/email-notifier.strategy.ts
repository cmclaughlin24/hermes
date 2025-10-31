import { MissingException } from '@hermes/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'nodemailer';
import { EmailTemplateService } from '../../email-template/email-template.service';
import { CreateEmailNotificationDto } from '../dto/create-email-notification.dto';
import { BaseNotifierStrategy } from './base-notifier.strategy';

@Injectable()
export class EmailNotifierStrategy extends BaseNotifierStrategy<CreateEmailNotificationDto> {
  private readonly logger = new Logger(EmailNotifierStrategy.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    super();
  }

  async notify(dto: CreateEmailNotificationDto): Promise<SentMessageInfo> {
    return this.mailerService.sendMail({
      ...dto,
      from: dto.from || this.configService.get('MAILER_SENDER'),
    });
  }

  async createNotificationDto(data: any) {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const dto = new CreateEmailNotificationDto();
    dto.to = data.to;
    dto.from = data.from;
    dto.timeZone = data.timeZone;
    dto.subject = data.subject;
    dto.text = data.text;
    dto.template = data.template;
    dto.html = data.html;
    dto.context = data.context;

    await this.validateOrReject(dto);

    return dto;
  }

  async createTemplate(createEmailNotificationDto: CreateEmailNotificationDto) {
    const templateName = createEmailNotificationDto.template;
    let html = createEmailNotificationDto.html;
    let subject = createEmailNotificationDto.subject;

    if (templateName) {
      html &&
        this.logger.warn(
          `[${this.createTemplate.name}] ${CreateEmailNotificationDto.name} contains both 'html' and 'template' keys, defaulting to 'template' key`,
        );

      const emailTemplate =
        await this.emailTemplateService.findOne(templateName);

      if (!emailTemplate) {
        throw new MissingException(`Email template ${templateName} not found!`);
      }

      subject = emailTemplate.subject;
      html = emailTemplate.template;
    }

    if (!html) {
      throw new Error(
        `Invalid Argument: ${CreateEmailNotificationDto.name} must have either 'html' or 'template' keys present`,
      );
    }

    const context = {
      timeZone: createEmailNotificationDto.timeZone,
      ...createEmailNotificationDto.context,
    };

    createEmailNotificationDto.subject = this.compileTemplate(subject, context);
    createEmailNotificationDto.html = this.compileTemplate(html, context);
    delete createEmailNotificationDto.template;
    delete createEmailNotificationDto.context;

    return createEmailNotificationDto;
  }
}
