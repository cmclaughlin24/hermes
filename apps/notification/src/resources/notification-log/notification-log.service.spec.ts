import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobState } from 'bullmq';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  MockSequelize,
  createMockRepository,
  createMockSequelize,
} from '../../../../notification/test/helpers/database.helpers';
import { NotificationAttempt } from './entities/notification-attempt.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';

describe('NotificationLogService', () => {
  let service: NotificationLogService;
  let notificationLogModel: MockRepository;
  let notificationAttempt: MockRepository;
  let sequelize: MockSequelize;

  const notificationLog: NotificationLog = {
    id: 'test1',
    job: JSON.stringify({}),
    state: 'completed',
    attempts: 0,
    data: JSON.stringify({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as NotificationLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationLogService,
        {
          provide: getModelToken(NotificationLog),
          useValue: createMockRepository<NotificationLog>(),
        },
        {
          provide: getModelToken(NotificationAttempt),
          useValue: createMockRepository<NotificationAttempt>(),
        },
        {
          provide: Sequelize,
          useValue: createMockSequelize(),
        },
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    notificationLogModel = module.get<MockRepository>(
      getModelToken(NotificationLog),
    );
    notificationAttempt = module.get<MockRepository>(
      getModelToken(NotificationAttempt),
    );
    sequelize = module.get<MockSequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      notificationLogModel.findAll.mockClear();
    });

    it('should yield a list of notification logs', async () => {
      // Arrange.
      const expectedResult: NotificationLog[] = [notificationLog];
      notificationLogModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll([], [])).resolves.toEqual(expectedResult);
    });

    it('should yield a list filtered by job name(s)', async () => {
      // Arrange.
      const jobs = ['email', 'sms'];
      const expectedResult = {
        where: { job: { [Op.or]: jobs } },
        include: [
          { model: NotificationAttempt, attributes: { exclude: ['logId'] } },
        ],
      };
      notificationLogModel.findAll.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll(jobs, []);

      // Assert.
      expect(notificationLogModel.findAll).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield a list filtered by job state(s)', async () => {
      // Arrange.
      const states: JobState[] = ['completed'];
      const expectedResult = {
        where: { state: { [Op.or]: states } },
        include: [
          { model: NotificationAttempt, attributes: { exclude: ['logId'] } },
        ],
      };
      notificationLogModel.findAll.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll([], states);

      // Assert.
      expect(notificationLogModel.findAll).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification logs not found!`,
      );
      notificationLogModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll([], [])).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification logs not found!`,
      );
      notificationLogModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll([], [])).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      notificationLogModel.findByPk.mockClear();
    });

    it('should yield a notification log', async () => {
      // Arrange.
      notificationLogModel.findByPk.mockResolvedValue(notificationLog);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).resolves.toEqual(
        notificationLog,
      );
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification Log with ${notificationLog.id} not found!`,
      );
      notificationLogModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('log()', () => {
    beforeEach(() => {
      sequelize.transaction.mockImplementation((callback) => callback());
    });

    afterEach(() => {
      notificationLogModel.create.mockClear();
      notificationLogModel.update.mockClear();
      notificationAttempt.create.mockClear();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (no attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
      } as Job;
      const expectedResult = {
        job: job.name,
        state: 'delayed',
        attempts: job.attemptsMade,
        data: job.data,
        addedAt: new Date(job.timestamp),
        finishedOn: null,
      };
      notificationLogModel.create.mockResolvedValue({ id: 'test' });

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(notificationLogModel.create).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
      expect(notificationAttempt.create).not.toHaveBeenCalled();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (completed attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
        processedOn: new Date().getTime(),
      } as Job;
      const expectedResult = {
        logId: 'test',
        attempt: job.attemptsMade,
        processedOn: new Date(job.processedOn),
        result: null,
        error: null,
      };
      notificationLogModel.create.mockResolvedValue({
        id: expectedResult.logId,
      });

      // Act.
      await service.log(job, 'completed', null, null);

      // Assert.
      expect(notificationLogModel.create).toHaveBeenCalled();
      expect(notificationAttempt.create).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (failed attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
        processedOn: new Date().getTime(),
      } as Job;
      const expectedResult = {
        logId: 'test',
        attempt: job.attemptsMade,
        processedOn: new Date(job.processedOn),
        result: null,
        error: null,
      };
      notificationLogModel.create.mockResolvedValue({
        id: expectedResult.logId,
      });

      // Act.
      await service.log(job, 'failed', null, null);

      // Assert.
      expect(notificationLogModel.create).toHaveBeenCalled();
      expect(notificationAttempt.create).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
    });

    it('should update a notification log if the "notification_datatbase_id" property is defined (no attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const log = {
        attempts: 1,
        update: jest.fn(() => ({ id: 'test' })),
      };
      const expectedResult = {
        state: 'delayed',
        attempts: job.attemptsMade,
        data: {},
        finishedOn: null,
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(log.update).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
      expect(notificationAttempt.create).not.toHaveBeenCalled();
    });

    it.todo('should update a notification log if the "notification_database_id" property is defined (completed attempt)');
    
    it.todo('should update a notification log if the "notification_database_id" property is defined (failed attempt)');

    it("should yield the notification log's database id (create)", async () => {
      // Arrange.
      const job = { name: 'email', attemptsMade: 2, data: {} } as Job;
      const expectedId = 'test';
      notificationLogModel.create.mockResolvedValue({ id: 'test' });

      // Act/Assert.
      await expect(service.log(job, 'completed', null, null)).resolves.toBe(
        expectedId,
      );
    });

    it("should yield the notification log's database id (update)", async () => {
      // Arrange.
      const expectedResult = 'test';
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: expectedResult },
      } as Job;
      const log = {
        attempts: 1,
        update: jest.fn(() => ({ id: expectedResult })),
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act/Assert.
      await expect(service.log(job, 'failed', null, null)).resolves.toBe(
        expectedResult,
      );
    });

    it('should not update a notification log if the number of attempts in the notification log are greater than the number attempts in the job', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const log = {
        attempts: 3,
        update: jest.fn(() => ({ id: 'test' })),
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await service.log(job, 'failed', null, null);

      // Assert.
      expect(log.update).not.toHaveBeenCalled();
    });
  });
});
