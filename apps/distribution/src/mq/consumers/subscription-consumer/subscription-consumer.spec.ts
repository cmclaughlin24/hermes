import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionConsumer } from './subscription-consumer';

describe('SubscriptionConsumer', () => {
  let provider: SubscriptionConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionConsumer],
    }).compile();

    provider = module.get<SubscriptionConsumer>(SubscriptionConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
