import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { NotificationAttempt } from './entities/notification-attempt.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { PhoneTemplate } from './entities/phone-template.entity';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';
import { EmailTemplateRepository } from '../../../resources/email-template/repository/email-template.repository';
import { PostgresEmailTemplateRepository } from './repositories/email-template.repository';
import { NotificationLogRepository } from '../../../resources/notification-log/repository/notification-log.repository';
import { PostgresNotificationLogRepository } from './repositories/notification-log.repository';
import { PhoneTemplateRepository } from '../../../resources/phone-template/repository/phone-template.repository';
import { PostgresPhoneTemplateRepository } from './repositories/phone-template.repository';
import { PushTemplateRepository } from '../../../resources/push-template/repository/push-template.repository';
import { PostgresPushTemplateRepository } from './repositories/push-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplate,
      NotificationAttempt,
      NotificationLog,
      PhoneTemplate,
      PushAction,
      PushTemplate,
    ]),
  ],
  providers: [
    {
      provide: EmailTemplateRepository,
      useClass: PostgresEmailTemplateRepository,
    },
    {
      provide: NotificationLogRepository,
      useClass: PostgresNotificationLogRepository,
    },
    {
      provide: PhoneTemplateRepository,
      useClass: PostgresPhoneTemplateRepository,
    },
    {
      provide: PushTemplateRepository,
      useClass: PostgresPushTemplateRepository,
    },
  ],
  exports: [
    EmailTemplateRepository,
    NotificationLogRepository,
    PhoneTemplateRepository,
    PushTemplateRepository,
  ],
})
export class PostgresPersistanceModule {}
