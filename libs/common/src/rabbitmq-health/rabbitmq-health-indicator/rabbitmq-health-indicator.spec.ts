import { RabbitmqHealthIndicator } from './rabbitmq-health-indicator';

describe('RabbitmqHealthIndicator', () => {
  it('should be defined', () => {
    expect(new RabbitmqHealthIndicator()).toBeDefined();
  });
});
