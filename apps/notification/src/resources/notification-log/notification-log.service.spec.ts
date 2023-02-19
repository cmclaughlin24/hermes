import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockRepository,
  MockRepository
} from '../../../../notification/test/helpers/database.helpers';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';

describe('NotificationLogService', () => {
  let service: NotificationLogService;
  let notificationLogModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationLogService,
        {
          provide: getModelToken(NotificationLog),
          useValue: createMockRepository<NotificationLog>(),
        },
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    notificationLogModel = module.get<MockRepository>(
      getModelToken(NotificationLog),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {});

  describe('findOne()', () => {});

  describe('createOrUpdate()', () => {});
});
