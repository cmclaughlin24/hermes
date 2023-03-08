import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationQueues } from '@notification/common';
import { NotificationJobController } from './notification-job.controller';
import { NotificationJobService } from './notification-job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NotificationQueues.DEFAULT,
    }),
  ],
  providers: [NotificationJobService],
  controllers: [NotificationJobController],
})
export class NotificationJobModule {}