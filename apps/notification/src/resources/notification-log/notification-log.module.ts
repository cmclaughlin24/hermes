import { Module } from '@nestjs/common';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogRepository } from './repository/notification-log.repository';
import { OrmNotificationLogRepository } from './repository/orm-notification-log.repository';
import { NotificationLog } from './repository/entities/notification-log.entity';
import { NotificationAttempt } from './repository/entities/notification-attempt.entity';
import { OrmDataSourceService } from '../../core/services/orm-data-source.service';

@Module({
  imports: [],
  controllers: [NotificationLogController],
  providers: [
    NotificationLogService,
    {
      provide: NotificationLogRepository,
      inject: [OrmDataSourceService],
      useFactory: (dataSource: OrmDataSourceService) =>
        new OrmNotificationLogRepository(
          dataSource.getRepository(NotificationLog),
          dataSource.getRepository(NotificationAttempt),
          dataSource.dataSource,
        ),
    },
  ],

  exports: [NotificationLogService],
})
export class NotificationLogModule {}
