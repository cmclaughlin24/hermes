import { Test, TestingModule } from '@nestjs/testing';
import { DistributionLogService } from './distribution-log.service';

describe('DistributionLogService', () => {
  let service: DistributionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionLogService],
    }).compile();

    service = module.get<DistributionLogService>(DistributionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
