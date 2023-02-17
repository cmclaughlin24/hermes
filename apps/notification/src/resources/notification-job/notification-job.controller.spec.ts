import { Test, TestingModule } from '@nestjs/testing';
import { NotificationJobController } from './notification-job.controller';

describe('NotificationJobController', () => {
  let controller: NotificationJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationJobController],
    }).compile();

    controller = module.get<NotificationJobController>(NotificationJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
