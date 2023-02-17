import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from './notification.consumer';

describe('NotificationService', () => {
  let service: NotificationConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationConsumer],
    }).compile();

    service = module.get<NotificationConsumer>(NotificationConsumer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
