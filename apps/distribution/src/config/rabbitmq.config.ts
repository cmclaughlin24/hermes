import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

export async function rabbitmqFactory(
  configService: ConfigService,
): Promise<RabbitMQConfig> {
  return {
    uri: configService.get('RABBITMQ_URI'),
    exchanges: [
      {
        name: configService.get('RABBITMQ_DISTRIBUTION_EXCHANGE'),
        type: 'direct',
        createExchangeIfNotExists: true,
      }
    ],
  };
}
