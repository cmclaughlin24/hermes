import { AutoMap } from '@automapper/classes';
import { NotificationAttempt } from './notification-attempt';

export class NotificationLog {
  @AutoMap()
  id: string;

  @AutoMap()
  job: string;

  @AutoMap()
  state: string;

  @AutoMap()
  attempts: number;

  @AutoMap()
  data: Record<string, any>;

  @AutoMap()
  addedAt: Date;

  @AutoMap()
  finishedAt: Date;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;

  @AutoMap(() => [NotificationAttempt])
  attemptHistory: NotificationAttempt[];
}
