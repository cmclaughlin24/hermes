import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { EmailTemplateModule } from '../resources/email-template/email-template.module';
import { PhoneTemplateModule } from '../resources/phone-template/phone-template.module';
import { EmailTemplateExistsRule } from './decorators/email-template-exists.decorator';
import { EmailService } from './providers/email/email.service';
import { PhoneService } from './providers/phone/phone.service';

@Module({
  imports: [
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
  ],
  providers: [EmailService, PhoneService, EmailTemplateExistsRule],
  exports: [EmailService, PhoneService],
})
export class CommonModule {}
