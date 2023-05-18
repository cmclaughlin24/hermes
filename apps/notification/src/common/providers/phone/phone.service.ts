import { PhoneMethods } from '@hermes/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import { TwilioService } from 'nestjs-twilio';
import { PhoneTemplateService } from '../../../resources/phone-template/phone-template.service';
import { CreatePhoneNotificationDto } from '../../dto/create-phone-notification.dto';
import { CreateNotificationDto } from '../../interfaces/create-notification-dto.interface';

@Injectable()
export class PhoneService implements CreateNotificationDto {
  private readonly logger = new Logger(PhoneService.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly phoneTemplateService: PhoneTemplateService,
  ) {}

  async sendText(createPhoneNotificationDto: CreatePhoneNotificationDto) {
    try {
      const result = await this.twilioService.client.messages.create({
        ...createPhoneNotificationDto,
        from:
          createPhoneNotificationDto.from ||
          this.configService.get('TWILIO_PHONE_NUMBER'),
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async sendCall(createPhoneNotificationDto: CreatePhoneNotificationDto) {
    try {
      const result = await this.twilioService.client.calls.create({
        twiml: createPhoneNotificationDto.body,
        to: createPhoneNotificationDto.to,
        from:
          createPhoneNotificationDto.from ||
          this.configService.get('TWILIO_PHONE_NUMBER'),
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

  async createPhoneTemplate(
    deliveryMethod: PhoneMethods,
    createPhoneNotificationDto: CreatePhoneNotificationDto,
  ) {
    const templateName = createPhoneNotificationDto.template;
    let body = createPhoneNotificationDto.body;

    if (templateName) {
      body &&
        this.logger.warn(
          `[${this.createPhoneTemplate.name}] ${CreatePhoneNotificationDto.name} contains both 'body' and 'template' keys, defaulting to 'template' key`,
        );

      const phoneTemplate = await this.phoneTemplateService.findOne(
        deliveryMethod,
        templateName,
      );

      body = phoneTemplate.template;
    }

    if (!body) {
      throw new Error(
        `Invalid Argument: ${CreatePhoneNotificationDto.name} must have either 'body' or 'template' keys present`,
      );
    }

    const template = Handlebars.compile(body);
    createPhoneNotificationDto.body = template({
      timeZone: createPhoneNotificationDto.timeZone,
      ...createPhoneNotificationDto.context,
    });

    return createPhoneNotificationDto;
  }
}
