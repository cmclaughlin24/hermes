import { errorToJson } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  createMockDataSource,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { DistributionJob } from '../../../common/types/distribution-job.type';
import { MessageState } from '../../../common/types/message-state.type';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';
import { OrmDistributionLogRepository } from './orm-distribution-log.repository';
import { DataSource } from 'typeorm';

describe('OrmDistributionLogRepository', () => {
  let repository: OrmDistributionLogRepository;
  let distributionLogModel: MockRepository;
  let distributionAttemptModel: MockRepository;

  const log = {
    id: '32641f47-785e-4f43-8249-fff97e5009d0',
    state: MessageState.COMPLETED,
    attempts: 2,
  } as DistributionLog;

  const job: DistributionJob = {
    id: 'unit-test',
    type: 'unit-test',
    attemptsMade: 0,
    metadata: null,
    payload: null,
    addedAt: new Date(),
    processedAt: new Date(),
    finishedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmDistributionLogRepository,
        {
          provide: getRepositoryToken(DistributionLog),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DistributionAttempt),
          useValue: createMockRepository(),
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(),
        },
      ],
    }).compile();

    repository = module.get<OrmDistributionLogRepository>(
      OrmDistributionLogRepository,
    );
    distributionLogModel = module.get<MockRepository>(
      getRepositoryToken(DistributionLog),
    );
    distributionAttemptModel = module.get<MockRepository>(
      getRepositoryToken(DistributionAttempt),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      distributionLogModel.find.mockClear();
    });

    it('should yield a list of distribution logs', async () => {
      // Arrange.
      const expectedResult: DistributionLog[] = [log];
      distributionLogModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution logs filtered by eventType(s)', async () => {
      // Arrange.
      const eventTypes = ['unit-test'];
      distributionLogModel.find.mockResolvedValue([log]);

      // Act.
      await repository.findAll(eventTypes, null);

      //Assert.
      expect(distributionLogModel.find).toHaveBeenCalledWith({
        where: { eventType: eventTypes },
        relations: { attemptHistory: true },
      });
    });

    it('should yield a list of distribution logs filtered by state(s)', async () => {
      // Arrange.
      const states = ['unit-test'];
      distributionLogModel.find.mockResolvedValue([log]);

      // Act.
      await repository.findAll(null, states);

      //Assert.
      expect(distributionLogModel.find).toHaveBeenCalledWith({
        where: { state: states },
        relations: { attemptHistory: true },
      });
    });

    it('should throw an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionLogModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll(null, null)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      distributionLogModel.findOne.mockClear();
    });

    it('should yield a distribution log', async () => {
      // Arrange.
      distributionLogModel.findOne.mockResolvedValue(log);

      // Act/Assert.
      await expect(repository.findOne('')).resolves.toEqual(log);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const id = '32641f47-785e-4f43-8249-fff97e5009d0';
      distributionLogModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(id)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    afterEach(() => {
      distributionLogModel.create.mockClear();
      distributionLogModel.save.mockClear();
    });

    it('should create a distribution log if the repository returns (no attempt)', async () => {
      // Arrange.
      const expectedResult = {
        id: job.id,
        eventType: job.type,
        state: MessageState.ACTIVE,
        attempts: job.attemptsMade,
        data: job.payload,
        metadata: job.metadata,
        addedAt: job.addedAt,
        finishedAt: job.finishedAt,
        attemptHistory: [],
      };

      // Act.
      await repository.create(job, MessageState.ACTIVE, null, null);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalledWith(expectedResult);
      expect(distributionAttemptModel.create).not.toHaveBeenCalled();
    });

    it('should create a distribution log if the repository returns null/undefined (completed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        result: {},
        error: null,
        attempt: job.attemptsMade,
        processedAt: job.processedAt,
      };
      distributionLogModel.create.mockReturnValue({
        id: job.id,
      });

      // Act.
      await repository.create(job, MessageState.COMPLETED, {}, null);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should create a distribution log if the repository returns null/undefined (failed attempt)', async () => {
      // Arrange.
      const error = errorToJson(new Error(''));
      const expectedResult = {
        result: null,
        error: error,
        attempt: job.attemptsMade,
        processedAt: job.processedAt,
      };
      distributionLogModel.create.mockReturnValue({
        id: job.id,
      });

      // Act.
      await repository.create(job, MessageState.FAILED, null, error);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield the distribution log (create)', async () => {
      // Arrange.
      const log = {
        id: job.id,
      };
      distributionLogModel.save.mockResolvedValue(log);

      // Act/Assert.
      await expect(
        repository.create(job, MessageState.ACTIVE, null, null),
      ).resolves.toEqual(log);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      distributionLogModel.preload.mockClear();
      distributionLogModel.save.mockClear();
      distributionAttemptModel.create.mockClear();
      distributionAttemptModel.save.mockClear();
    });

    it('should update a distribution log (no attempt)', async () => {
      // Arrange.
      const log = {
        state: MessageState.ACTIVE,
        attempts: job.attemptsMade,
        finishedAt: job.finishedAt,
      };
      distributionLogModel.preload.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.ACTIVE, null, null);

      // Assert.
      expect(distributionLogModel.save).toHaveBeenCalledWith(log);
      expect(distributionAttemptModel.create).not.toHaveBeenCalled();
    });

    it('should update a distribution log (completed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: {},
        error: null,
        attempt: job.attemptsMade,
        processedAt: job.processedAt,
      };
      const log = {
        id: job.id,
        result: {},
        error: null,
        attempts: job.attemptsMade,
        processedAt: job.processedAt,
      };
      distributionLogModel.preload.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.COMPLETED, {}, null);

      // Assert.
      expect(distributionLogModel.save).toHaveBeenCalledWith(log);
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should update a distribution log (failed  attempt)', async () => {
      // Arrange.
      const error = errorToJson(new Error(''));
      const expectedResult = {
        logId: job.id,
        result: null,
        error: error,
        attempt: job.attemptsMade,
        processedAt: job.processedAt,
      };
      const log = {
        id: job.id,
      };
      distributionLogModel.preload.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.FAILED, null, error);

      // Assert.
      expect(distributionLogModel.save).toHaveBeenCalledWith(log);
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield the distribution log (update)', async () => {
      // Arrange.
      const log = {
        logId: job.id,
      };
      distributionLogModel.save.mockResolvedValue(log);

      // Act/Assert.
      await expect(
        repository.update(job, MessageState.ACTIVE, null, null),
      ).resolves.toEqual(log);
    });
  });
});
