import { Module } from '@nestjs/common';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogRepository } from './repository/notification-log.repository';
import { OrmNotificationLogRepository } from './repository/orm-notification-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity } from './repository/entities/notification-log.entity';
import { NotificationAttemptEntity } from './repository/entities/notification-attempt.entity';
import { NotificationLogProfile } from './profiles/notification-log.profile';
import { NotificationAttemptProfile } from './profiles/notification-attempt.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationLogEntity,
      NotificationAttemptEntity,
    ]),
  ],
  controllers: [NotificationLogController],
  providers: [
    NotificationLogService,
    NotificationLogProfile,
    NotificationAttemptProfile,
    {
      provide: NotificationLogRepository,
      useClass: OrmNotificationLogRepository,
    },
  ],

  exports: [NotificationLogService],
})
export class NotificationLogModule {}
