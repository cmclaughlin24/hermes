import { Module } from '@nestjs/common';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';

@Module({
  controllers: [NotificationLogController],
  providers: [NotificationLogService],
  exports: [NotificationLogService],
})
export class NotificationLogModule {}
