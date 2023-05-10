import { Test, TestingModule } from '@nestjs/testing';
import { DistributionEventController } from './distribution-event.controller';
import { DistributionEventService } from './distribution-event.service';

describe('DistributionEventController', () => {
  let controller: DistributionEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionEventController],
      providers: [DistributionEventService],
    }).compile();

    controller = module.get<DistributionEventController>(DistributionEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
