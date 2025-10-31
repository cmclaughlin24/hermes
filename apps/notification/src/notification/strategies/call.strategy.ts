import { DeliveryMethods } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { PhoneStrategy } from './phone.strategy';
import { TwilioService } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';

@Injectable()
export class CallStrategy extends PhoneStrategy {
  readonly type: DeliveryMethods.CALL = DeliveryMethods.CALL;

  constructor(
    twilioService: TwilioService,
    configService: ConfigService,
    phoneTemplateService: PhoneTemplateService,
  ) {
    super(twilioService, configService, phoneTemplateService);
  }

  async notify(dto: CreatePhoneNotificationDto): Promise<any> {
    try {
      const result = await this.twilioService.client.calls.create({
        twiml: dto.body,
        to: dto.to,
        from: dto.from || this.configService.get('TWILIO_PHONE_NUMBER'),
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
