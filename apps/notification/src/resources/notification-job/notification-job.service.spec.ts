import { Test, TestingModule } from '@nestjs/testing';
import { NotificationJobService } from './notification-job.service';

describe('NotificationJobService', () => {
  let service: NotificationJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationJobService],
    }).compile();

    service = module.get<NotificationJobService>(NotificationJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
