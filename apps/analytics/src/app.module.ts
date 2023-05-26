import { Module } from '@nestjs/common';
import { MqModule } from './mq/mq.module';

@Module({
  imports: [MqModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
