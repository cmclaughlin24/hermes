import { Module } from '@nestjs/common';
import { MqModule } from '../../mq/mq.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [MqModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
