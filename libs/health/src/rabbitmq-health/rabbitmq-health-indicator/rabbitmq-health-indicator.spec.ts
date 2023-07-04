import { RabbitMQHealthIndicator } from './rabbitmq-health-indicator';

describe('RabbitmqHealthIndicator', () => {
  it('should be defined', () => {
    expect(new RabbitMQHealthIndicator()).toBeDefined();
  });
});
