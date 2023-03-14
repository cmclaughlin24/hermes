import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

export async function rabbitmqFactory(
  configService: ConfigService,
): Promise<RabbitMQConfig> {
  return {
    uri: configService.get('RABBITMQ_URI'),
    exchanges: [
      {
        name: 'test',
        type: 'fanout',
        createExchangeIfNotExists: true,
      }
    ],
  };
}
