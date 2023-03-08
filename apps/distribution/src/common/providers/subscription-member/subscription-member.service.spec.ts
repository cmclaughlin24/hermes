import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionMemberService } from './subscription-member.service';

describe('SubscriptionMemberService', () => {
  let service: SubscriptionMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionMemberService],
    }).compile();

    service = module.get<SubscriptionMemberService>(SubscriptionMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
