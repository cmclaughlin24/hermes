import { Controller } from '@nestjs/common';
import { NotificationLogService } from './notification-log.service';

@Controller('notification-log')
export class NotificationLogController {
  constructor(private readonly notificationLogService: NotificationLogService) {}
}
