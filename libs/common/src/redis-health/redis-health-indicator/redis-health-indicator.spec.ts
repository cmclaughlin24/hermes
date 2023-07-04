import { RedisHealthIndicator } from './redis-health-indicator';

describe('RedisHealthIndicator', () => {
  it('should be defined', () => {
    expect(new RedisHealthIndicator()).toBeDefined();
  });
});
