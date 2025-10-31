import { Test, TestingModule } from '@nestjs/testing';
import { NotifierStrategyService } from './notifier-strategy.service';

describe('NotifierStrategyService', () => {
  let service: NotifierStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifierStrategyService],
    }).compile();

    service = module.get<NotifierStrategyService>(NotifierStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
