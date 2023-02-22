import { Test, TestingModule } from '@nestjs/testing';
import { DefaultSubscriberController } from './default-event-handler.controller';

describe('DefaultSubscriberController', () => {
  let controller: DefaultSubscriberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultSubscriberController],
    }).compile();

    controller = module.get<DefaultSubscriberController>(DefaultSubscriberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
