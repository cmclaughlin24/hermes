import { errorToJson } from '@hermes/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  MockSequelize,
  createMockRepository,
  createMockSequelize,
} from '../../../../test/helpers/database.helper';
import { DistributionJob } from '../../../common/types/distribution-job.type';
import { MessageState } from '../../../common/types/message-state.type';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';
import { OrmDistributionLogRepository } from './orm-distribution-log.repository';

describe('PostgresDistributionLogRepository', () => {
  let repository: OrmDistributionLogRepository;
  let distributionLogModel: MockRepository;
  let distributionAttemptModel: MockRepository;
  let sequelize: MockSequelize;

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
          provide: getModelToken(DistributionLog),
          useValue: createMockRepository(),
        },
        {
          provide: getModelToken(DistributionAttempt),
          useValue: createMockRepository(),
        },
        {
          provide: Sequelize,
          useValue: createMockSequelize(),
        },
      ],
    }).compile();

    repository = module.get<OrmDistributionLogRepository>(
      OrmDistributionLogRepository,
    );
    distributionLogModel = module.get<MockRepository>(
      getModelToken(DistributionLog),
    );
    distributionAttemptModel = module.get<MockRepository>(
      getModelToken(DistributionAttempt),
    );
    sequelize = module.get<MockSequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      distributionLogModel.findAll.mockClear();
    });

    it('should yield a list of distribution logs', async () => {
      // Arrange.
      const expectedResult: DistributionLog[] = [log];
      distributionLogModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution logs filtered by eventType(s)', async () => {
      // Arrange.
      const eventTypes = ['unit-test'];
      distributionLogModel.findAll.mockResolvedValue([log]);

      // Act.
      await repository.findAll(eventTypes, null);

      //Assert.
      expect(distributionLogModel.findAll).toHaveBeenCalledWith({
        where: { eventType: { [Op.or]: eventTypes } },
        include: [DistributionAttempt],
      });
    });

    it('should yield a list of distribution logs filtered by state(s)', async () => {
      // Arrange.
      const states = ['unit-test'];
      distributionLogModel.findAll.mockResolvedValue([log]);

      // Act.
      await repository.findAll(null, states);

      //Assert.
      expect(distributionLogModel.findAll).toHaveBeenCalledWith({
        where: { state: { [Op.or]: states } },
        include: [DistributionAttempt],
      });
    });

    it('should throw an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionLogModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll(null, null)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      distributionLogModel.findByPk.mockClear();
    });

    it('should yield a distribution log', async () => {
      // Arrange.
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act/Assert.
      await expect(repository.findOne('')).resolves.toEqual(log);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const id = '32641f47-785e-4f43-8249-fff97e5009d0';
      distributionLogModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(id)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    beforeEach(() => {
      sequelize.transaction.mockImplementation((callback) => callback());
    });

    afterEach(() => {
      distributionLogModel.findByPk.mockClear();
      distributionLogModel.create.mockClear();
      distributionAttemptModel.create.mockClear();
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
      };

      // Act.
      await repository.create(job, MessageState.ACTIVE, null, null);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
      expect(distributionAttemptModel.create).not.toHaveBeenCalled();
    });

    it('should create a distribution log if the repository returns null/undefined (completed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: {},
        error: null,
        attempt: job.attemptsMade,
        processedOn: job.processedAt,
      };
      distributionLogModel.create.mockResolvedValue({
        id: job.id,
        reload: jest.fn(),
      });

      // Act.
      await repository.create(job, MessageState.COMPLETED, {}, null);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should create a distribution log if the repository returns null/undefined (failed attempt)', async () => {
      // Arrange.
      const error = errorToJson(new Error(''));
      const expectedResult = {
        logId: job.id,
        result: null,
        error: error,
        attempt: job.attemptsMade,
        processedOn: job.processedAt,
      };
      distributionLogModel.create.mockResolvedValue({
        id: job.id,
        reload: jest.fn(),
      });

      // Act.
      await repository.create(job, MessageState.FAILED, null, error);

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should yield the distribution log (create)', async () => {
      // Arrange.
      const log = {
        reload: jest.fn(() => log),
      };
      distributionLogModel.create.mockResolvedValue(log);

      // Act/Assert.
      await expect(
        repository.create(job, MessageState.ACTIVE, null, null),
      ).resolves.toEqual(log);
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      sequelize.transaction.mockImplementation((callback) => callback());
    });

    afterEach(() => {
      distributionLogModel.findByPk.mockClear();
      distributionLogModel.update.mockClear();
      distributionAttemptModel.create.mockClear();
    });

    it('should update a distribution log (no attempt)', async () => {
      // Arrange.
      const expectedResult = {
        state: MessageState.ACTIVE,
        attempts: job.attemptsMade,
        finishedAt: job.finishedAt,
      };
      const log = {
        update: jest.fn(() => ({ id: job.id })),
        reload: jest.fn(),
      };
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.ACTIVE, null, null);

      // Assert.
      expect(log.update).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
      expect(distributionAttemptModel.create).not.toHaveBeenCalled();
    });

    it('should update a distribution log (completed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: {},
        error: null,
        attempt: job.attemptsMade,
        processedOn: job.processedAt,
      };
      const log = {
        id: job.id,
        update: jest.fn(),
        reload: jest.fn(),
      };
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.COMPLETED, {}, null);

      // Assert.
      expect(log.update).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
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
        processedOn: job.processedAt,
      };
      const log = {
        id: job.id,
        update: jest.fn(),
        reload: jest.fn(),
      };
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await repository.update(job, MessageState.FAILED, null, error);

      // Assert.
      expect(log.update).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should yield the distribution log (update)', async () => {
      // Arrange.
      const log = {
        update: jest.fn(() => log),
        reload: jest.fn(() => log),
      };
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act/Assert.
      await expect(
        repository.update(job, MessageState.ACTIVE, null, null),
      ).resolves.toEqual(log);
    });
  });
});
