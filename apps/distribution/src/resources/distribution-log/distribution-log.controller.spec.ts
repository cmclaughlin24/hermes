import { Test, TestingModule } from '@nestjs/testing';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';

describe('DistributionLogController', () => {
  let controller: DistributionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionLogController],
      providers: [DistributionLogService],
    }).compile();

    controller = module.get<DistributionLogController>(DistributionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
