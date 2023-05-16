import { Test, TestingModule } from '@nestjs/testing';
import { MqConsumer } from './mq.consumer';

describe('MqConsumer', () => {
  let provider: MqConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MqConsumer],
    }).compile();

    provider = module.get<MqConsumer>(MqConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
