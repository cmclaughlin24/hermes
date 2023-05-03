import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { TwilioService } from 'nestjs-twilio';
import { CreatePhoneNotificationDto } from '../../dto/create-phone-notification.dto';
import { CreateNotificationDto } from '../../interfaces/create-notification-dto.interface';

@Injectable()
export class PhoneService implements CreateNotificationDto {
  private readonly logger = new Logger(PhoneService.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
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
    createPhoneNotificationDto.body = data.body;
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
}
