import { Test, TestingModule } from '@nestjs/testing';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';

export type MockNotificationLogService = Partial<
  Record<keyof NotificationLogService, jest.Mock>
>;

export const createNotificationLogServiceMock =
  (): MockNotificationLogService => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
  });

describe('NotificationLogController', () => {
  let controller: NotificationLogController;
  let service: MockNotificationLogService;

  const notificationLog: NotificationLog = {
    id: 'test1',
    job: JSON.stringify({}),
    status: 'completed',
    attempts: 0,
    data: JSON.stringify({}),
    result: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as NotificationLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationLogController],
      providers: [
        {
          provide: NotificationLogService,
          useValue: createNotificationLogServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<NotificationLogController>(
      NotificationLogController,
    );
    service = module.get<MockNotificationLogService>(NotificationLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of email templates', async () => {
    // Arrange.
    const expectedResult: NotificationLog[] = [notificationLog];
    service.findAll.mockResolvedValue(expectedResult);

    // Act/Assert.
    await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should yield a notification log', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(notificationLog);

      // Act/Assert.
      await expect(controller.findOne(notificationLog.id)).resolves.toEqual(
        notificationLog,
      );
    });
  });
});
