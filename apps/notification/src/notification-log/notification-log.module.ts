import { Module } from '@nestjs/common';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogRepository } from './repository/notification-log.repository';
import { OrmNotificationLogRepository } from './repository/orm-notification-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity } from './repository/entities/notification-log.entity';
import { NotificationAttemptEntity } from './repository/entities/notification-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity, NotificationAttemptEntity])],
  controllers: [NotificationLogController],
  providers: [
    NotificationLogService,
    {
      provide: NotificationLogRepository,
      useClass: OrmNotificationLogRepository,
    },
  ],

  exports: [NotificationLogService],
})
export class NotificationLogModule {}
