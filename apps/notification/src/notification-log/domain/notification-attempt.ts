import { AutoMap } from '@automapper/classes';
import { NotificationLog } from './notification-log';

export class NotificationAttempt {
  logId: string;

  attempt: number;

  processedAt: Date;

  @AutoMap()
  result: any;

  @AutoMap()
  error: any;

  @AutoMap(() => NotificationLog)
  log?: NotificationLog;
}
