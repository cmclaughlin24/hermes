import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { EmailTemplateModule } from '../resources/email-template/email-template.module';
import { PhoneTemplateModule } from '../resources/phone-template/phone-template.module';
import { PushTemplateModule } from '../resources/push-template/push-template.module';
import { EmailTemplateExistsRule } from './decorators/email-template-exists.decorator';
import { EmailService } from './services/email/email.service';
import { PhoneService } from './services/phone/phone.service';
import { PushNotificationService } from './services/push-notification/push-notification.service';

@Module({
  imports: [
    HttpModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('MAILER_HOST'),
            port: configService.get('MAILER_PORT'),
            auth: {
              user: configService.get('MAILER_USER'),
              pass: configService.get('MAILER_PASSWORD'),
            },
          },
        };
      },
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN'),
      }),
    }),
    EmailTemplateModule,
    PhoneTemplateModule,
    PushTemplateModule,
  ],
  providers: [
    EmailService,
    PhoneService,
    EmailTemplateExistsRule,
    PushNotificationService,
  ],
  exports: [EmailService, PhoneService, PushNotificationService],
})
export class CommonModule {}
