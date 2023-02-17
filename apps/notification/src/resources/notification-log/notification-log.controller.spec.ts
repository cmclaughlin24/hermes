import { Test, TestingModule } from '@nestjs/testing';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';

describe('NotificationLogController', () => {
  let controller: NotificationLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationLogController],
      providers: [NotificationLogService],
    }).compile();

    controller = module.get<NotificationLogController>(NotificationLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
