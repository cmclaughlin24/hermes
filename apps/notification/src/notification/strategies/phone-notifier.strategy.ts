import { DeliveryMethods, MissingException } from '@hermes/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';
import { Logger } from '@nestjs/common';
import { BaseNotifierStrategy } from './base-notifier.strategy';
import { DtoValidationException } from '../../common/errors/dto-validation.error';

export abstract class PhoneNotifierStrategy extends BaseNotifierStrategy<CreatePhoneNotificationDto> {
  abstract type: DeliveryMethods.CALL | DeliveryMethods.SMS;
  protected readonly logger = new Logger(PhoneNotifierStrategy.name);

  constructor(
    protected readonly twilioService: TwilioService,
    protected readonly configService: ConfigService,
    protected readonly phoneTemplateService: PhoneTemplateService,
  ) {
    super();
  }

  async createNotificationDto(data: any): Promise<CreatePhoneNotificationDto> {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const dto = new CreatePhoneNotificationDto();
    dto.to = data.to;
    dto.from = data.from;
    dto.timeZone = data.timeZone;
    dto.body = data.body;
    dto.template = data.template;
    dto.context = data.context;

    await this.validateOrReject(dto);

    return dto;
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
      throw new DtoValidationException(
        `Invalid Argument: ${CreatePhoneNotificationDto.name} must have either 'body' or 'template' keys present`,
      );
    }

    dto.body = this.compileTemplate(body, {
      timeZone: dto.timeZone,
      ...dto.context,
    });

    return dto;
  }

  abstract notify(dto: CreatePhoneNotificationDto): Promise<any>;
}
