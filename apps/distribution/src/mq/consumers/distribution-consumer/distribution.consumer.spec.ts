import { Test, TestingModule } from '@nestjs/testing';
import { DistributionConsumer } from './distribution.consumer';

describe('DistributionConsumer', () => {
  let provider: DistributionConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionConsumer],
    }).compile();

    provider = module.get<DistributionConsumer>(DistributionConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
