import { Test, TestingModule } from '@nestjs/testing';
import { DistributionRuleService } from './distribution-rule.service';

describe('DistributionRuleService', () => {
  let service: DistributionRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionRuleService],
    }).compile();

    service = module.get<DistributionRuleService>(DistributionRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
