import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { NotificationLogModule } from '../resources/notification-log/notification-log.module';
import { NotificationConsumer } from './notification-consumer/notification.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    CommonModule,
    NotificationLogModule
  ],
  providers: [NotificationConsumer],
  controllers: [],
})
export class ConsumerModule {}
