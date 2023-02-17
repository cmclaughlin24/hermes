import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [CommonModule],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
