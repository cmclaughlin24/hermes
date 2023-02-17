import { Module } from '@nestjs/common';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogController } from './notification-log.controller';

@Module({
  controllers: [NotificationLogController],
  providers: [NotificationLogService]
})
export class NotificationLogModule {}
