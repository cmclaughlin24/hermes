import { DeliveryMethods, MissingException } from '@hermes/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import Handlebars from 'handlebars';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { NotifierStrategy } from '../interfaces/notifier-strategy.interface';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';
import { validateOrReject } from 'class-validator';
import { Logger } from '@nestjs/common';

export abstract class PhoneStrategy
  implements NotifierStrategy<CreatePhoneNotificationDto>
{
  abstract type: DeliveryMethods.CALL | DeliveryMethods.SMS;
  protected readonly logger = new Logger(PhoneStrategy.name);

  constructor(
    protected readonly twilioService: TwilioService,
    protected readonly configService: ConfigService,
    protected readonly phoneTemplateService: PhoneTemplateService,
  ) {}

  async createNotificationDto(data: any): Promise<CreatePhoneNotificationDto> {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const createPhoneNotificationDto = new CreatePhoneNotificationDto();
    createPhoneNotificationDto.to = data.to;
    createPhoneNotificationDto.from = data.from;
    createPhoneNotificationDto.timeZone = data.timeZone;
    createPhoneNotificationDto.body = data.body;
    createPhoneNotificationDto.template = data.template;
    createPhoneNotificationDto.context = data.context;

    try {
      await validateOrReject(createPhoneNotificationDto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new Error(validationErrors);
    }

    return createPhoneNotificationDto;
  }

  async createTemplate(
    dto: CreatePhoneNotificationDto,
  ): Promise<CreatePhoneNotificationDto> {
    const templateName = dto.template;
    let body = dto.body;

    if (templateName) {
      body &&
        this.logger.warn(
          `[${this.createTemplate.name}] ${CreatePhoneNotificationDto.name} contains both 'body' and 'template' keys, defaulting to 'template' key`,
        );

      const phoneTemplate = await this.phoneTemplateService.findOne(
        this.type,
        templateName,
      );

      if (!phoneTemplate) {
        throw new MissingException(
          `Phone template name=${templateName} for deliveryMethod=${this.type} not found!`,
        );
      }

      body = phoneTemplate.template;
    }

    if (!body) {
      throw new Error(
        `Invalid Argument: ${CreatePhoneNotificationDto.name} must have either 'body' or 'template' keys present`,
      );
    }

    const template = Handlebars.compile(body);
    dto.body = template({
      timeZone: dto.timeZone,
      ...dto.context,
    });

    return dto;
  }

  abstract notify(dto: CreatePhoneNotificationDto): Promise<any>;
}
