import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
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
      // Note: Bullmq requires the prefix option as a cluster "hash tag". See
      //       https://docs.bullmq.io/bull/patterns/redis-cluster for more information.
      prefix: process.env.BULLMQ_NOTIFICATION_QUEUE_PREFIX,
    }),
    BullBoardModule.forFeature({
      name: process.env.BULLMQ_NOTIFICATION_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [NotificationJobService],
  controllers: [NotificationJobController],
})
export class NotificationJobModule {}
