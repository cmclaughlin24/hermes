import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionFilterService } from './subscription-filter.service';

describe('SubscriptionFilterService', () => {
  let service: SubscriptionFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionFilterService],
    }).compile();

    service = module.get<SubscriptionFilterService>(SubscriptionFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
