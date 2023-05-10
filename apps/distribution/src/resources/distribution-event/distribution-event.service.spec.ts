import { Test, TestingModule } from '@nestjs/testing';
import { DistributionEventService } from './distribution-event.service';

describe('DistributionEventService', () => {
  let service: DistributionEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionEventService],
    }).compile();

    service = module.get<DistributionEventService>(DistributionEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
