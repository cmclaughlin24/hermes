import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { NotificationLogModule } from '../resources/notification-log/notification-log.module';
import { NotificationConsumer } from './notification-consumer/notification.consumer';

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
    CommonModule,
    NotificationLogModule,
  ],
  providers: [NotificationConsumer],
  controllers: [],
})
export class ConsumerModule {}
