import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationJobController } from './notification-job.controller';
import { NotificationJobService } from './notification-job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      // Note: BullModule throws an error when using the ConfigModule to retrieve
      //       the notification queue name from the environment.
      name: process.env.BULLMQ_NOTIFICATION_QUEUE,
    }),
  ],
  providers: [NotificationJobService],
  controllers: [NotificationJobController],
})
export class NotificationJobModule {}
