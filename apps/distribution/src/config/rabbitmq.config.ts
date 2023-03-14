import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { DistributionExchanges } from '@notification/common';

export async function rabbitmqFactory(
  configService: ConfigService,
): Promise<RabbitMQConfig> {
  return {
    uri: configService.get('RABBITMQ_URI'),
    exchanges: [
      {
        name: DistributionExchanges.DEFAULT,
        type: 'direct',
        createExchangeIfNotExists: true,
      }
    ],
  };
}
