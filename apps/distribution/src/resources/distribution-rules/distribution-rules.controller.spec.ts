import { Test, TestingModule } from '@nestjs/testing';
import { DistributionRulesController } from './distribution-rules.controller';
import { DistributionRulesService } from './distribution-rules.service';

describe('DistributionRulesController', () => {
  let controller: DistributionRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionRulesController],
      providers: [DistributionRulesService],
    }).compile();

    controller = module.get<DistributionRulesController>(DistributionRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
