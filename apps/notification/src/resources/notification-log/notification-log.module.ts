import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationAttempt } from './entities/notification-attempt.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';

@Module({
  imports: [SequelizeModule.forFeature([NotificationLog, NotificationAttempt])],
  controllers: [NotificationLogController],
  providers: [NotificationLogService],
  exports: [NotificationLogService],
})
export class NotificationLogModule {}
