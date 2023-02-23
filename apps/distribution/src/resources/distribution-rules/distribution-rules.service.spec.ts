import { Test, TestingModule } from '@nestjs/testing';
import { DistributionRulesService } from './distribution-rules.service';

describe('DistributionRulesService', () => {
  let service: DistributionRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionRulesService],
    }).compile();

    service = module.get<DistributionRulesService>(DistributionRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
