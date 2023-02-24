import { Test, TestingModule } from '@nestjs/testing';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';

describe('DistributionRuleController', () => {
  let controller: DistributionRuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionRuleController],
      providers: [DistributionRuleService],
    }).compile();

    controller = module.get<DistributionRuleController>(DistributionRuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
