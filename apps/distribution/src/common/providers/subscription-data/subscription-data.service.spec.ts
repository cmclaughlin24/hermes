import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionDataService } from './subscription-data.service';

describe('SubscriptionDataService', () => {
  let service: SubscriptionDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionDataService],
    }).compile();

    service = module.get<SubscriptionDataService>(SubscriptionDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
