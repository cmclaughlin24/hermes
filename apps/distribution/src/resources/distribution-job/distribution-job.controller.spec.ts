import { Test, TestingModule } from '@nestjs/testing';
import { DistributionJobController } from './distribution-job.controller';
import { DistributionJobService } from './distribution-job.service';

describe('DistributionJobController', () => {
  let controller: DistributionJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionJobController],
      providers: [DistributionJobService],
    }).compile();

    controller = module.get<DistributionJobController>(DistributionJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
