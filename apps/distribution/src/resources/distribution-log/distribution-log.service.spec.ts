import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  MockSequelize,
  createMockRepository,
  createMockSequelize,
} from '../../../test/helpers/database.helpers';
import { DistributionJob } from '../../common/types/distribution-job.type';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionLogService } from './distribution-log.service';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

describe('DistributionLogService', () => {
  let service: DistributionLogService;
  let distributionLogModel: MockRepository;
  let distributionAttemptModel: MockRepository;
  let sequelize: MockSequelize;

  const log = {
    id: '32641f47-785e-4f43-8249-fff97e5009d0',
    queue: 'unit-test',
    state: MessageState.COMPLETED,
    attempts: 2,
  } as DistributionLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionLogService,
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

    service = module.get<DistributionLogService>(DistributionLogService);
    distributionLogModel = module.get<MockRepository>(
      getModelToken(DistributionLog),
    );
    distributionAttemptModel = module.get<MockRepository>(
      getModelToken(DistributionAttempt),
    );
    sequelize = module.get<MockSequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      await expect(service.findAll(null, null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution logs filtered by queue(s)', async () => {
      // Arrange.
      const queues = ['unit-test'];
      distributionLogModel.findAll.mockResolvedValue([log]);

      // Act.
      await service.findAll(queues, null, null);

      //Assert.
      expect(distributionLogModel.findAll).toHaveBeenCalledWith({
        where: { queue: { [Op.or]: queues } },
        include: [DistributionAttempt],
      });
    });

    it('should yield a list of distribution logs filtered by messageType(s)', async () => {
      // Arrange.
      const messageTypes = ['unit-test'];
      distributionLogModel.findAll.mockResolvedValue([log]);

      // Act.
      await service.findAll(null, messageTypes, null);

      //Assert.
      expect(distributionLogModel.findAll).toHaveBeenCalledWith({
        where: { messageType: { [Op.or]: messageTypes } },
        include: [DistributionAttempt],
      });
    });

    it('should yield a list of distribution logs filtered by state(s)', async () => {
      // Arrange.
      const states = ['unit-test'];
      distributionLogModel.findAll.mockResolvedValue([log]);

      // Act.
      await service.findAll(null, null, states);

      //Assert.
      expect(distributionLogModel.findAll).toHaveBeenCalledWith({
        where: { state: { [Op.or]: states } },
        include: [DistributionAttempt],
      });
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution logs not found!`,
      );
      distributionLogModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll(null, null, null)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution logs not found!`,
      );
      distributionLogModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null, null, null)).rejects.toEqual(
        expectedResult,
      );
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
      await expect(service.findOne('')).resolves.toEqual(log);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const id = '32641f47-785e-4f43-8249-fff97e5009d0';
      const expectedResult = new NotFoundException(
        `Distribution log with id=${id} not found!`,
      );
      distributionLogModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).rejects.toEqual(expectedResult);
    });
  });

  describe('log()', () => {
    const job: DistributionJob = {
      id: 'unit-test',
      queue: 'unit-test',
      type: 'unit-test',
      attemptsMade: 0,
      metadata: null,
      payload: null,
      addedAt: new Date(),
      processedAt: new Date(),
      finishedAt: new Date(),
    };

    beforeEach(() => {
      sequelize.transaction.mockImplementation((callback) => callback());
    });

    afterEach(() => {
      distributionLogModel.findByPk.mockClear();
      distributionLogModel.create.mockClear();
      distributionLogModel.update.mockClear();
      distributionAttemptModel.create.mockClear();
    });

    it('should create a distribution log if the repository returns null/undefined (no attempt)', async () => {
      // Arrange.
      const expectedResult = {
        id: job.id,
        queue: job.queue,
        messageType: job.type,
        state: MessageState.ACTIVE,
        attempts: job.attemptsMade,
        data: job.payload,
        metadata: job.metadata,
        addedAt: job.addedAt,
        finishedAt: job.finishedAt,
      };

      // Act.
      await service.log(job, MessageState.ACTIVE);

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
        error: undefined,
        attempt: job.attemptsMade,
        processedOn: job.processedAt,
      };
      distributionLogModel.create.mockResolvedValue({
        id: job.id,
        reload: jest.fn(),
      });

      // Act.
      await service.log(job, MessageState.COMPLETED, {});

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should create a distribution log if the repository returns null/undefined (failed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: null,
        error: {},
        attempt: job.attemptsMade,
        processedOn: job.processedAt,
      };
      distributionLogModel.create.mockResolvedValue({
        id: job.id,
        reload: jest.fn(),
      });

      // Act.
      await service.log(job, MessageState.FAILED, null, {});

      // Assert.
      expect(distributionLogModel.create).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should update a distribution log if the repository ... (no attempt)', async () => {
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
      await service.log(job, MessageState.ACTIVE);

      // Assert.
      expect(log.update).toHaveBeenCalledWith(expectedResult, {
        transaction: undefined,
      });
      expect(distributionAttemptModel.create).not.toHaveBeenCalled();
    });

    it('should update a distribution log if the repository ... (completed attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: {},
        error: undefined,
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
      await service.log(job, MessageState.COMPLETED, {});

      // Assert.
      expect(log.update).toHaveBeenCalled();
      expect(distributionAttemptModel.create).toHaveBeenCalledWith(
        expectedResult,
        { transaction: undefined },
      );
    });

    it('should update a distribution log if the repository ... (failed  attempt)', async () => {
      // Arrange.
      const expectedResult = {
        logId: job.id,
        result: null,
        error: {},
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
      await service.log(job, MessageState.FAILED, null, {});

      // Assert.
      expect(log.update).toHaveBeenCalled();
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
      await expect(service.log(job, MessageState.ACTIVE)).resolves.toEqual(log);
    });

    it('should yield the distribution log (update)', async () => {
      // Arrange.
      const log = {
        update: jest.fn(() => log),
        reload: jest.fn(() => log),
      };
      distributionLogModel.findByPk.mockResolvedValue(log);

      // Act/Assert.
      await expect(service.log(job, MessageState.ACTIVE)).resolves.toEqual(log);
    });
  });
});
