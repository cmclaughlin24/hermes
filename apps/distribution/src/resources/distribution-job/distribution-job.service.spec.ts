import { Test, TestingModule } from '@nestjs/testing';
import { DistributionJobService } from './distribution-job.service';

describe('DistributionJobService', () => {
  let service: DistributionJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionJobService],
    }).compile();

    service = module.get<DistributionJobService>(DistributionJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
