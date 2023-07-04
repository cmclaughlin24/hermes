import { Module } from '@nestjs/common';
import { RabbitMQHealthIndicator } from './rabbitmq-health-indicator/rabbitmq-health-indicator';

@Module({
  providers: [RabbitMQHealthIndicator],
  exports: [RabbitMQHealthIndicator],
})
export class RabbitMQHealthModule {}
