import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationJobController } from './notification-job.controller';
import { NotificationJobService } from './notification-job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationJobService],
  controllers: [NotificationJobController],
})
export class NotificationJobModule {}