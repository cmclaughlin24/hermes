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
import { PostgresDistributionLogRepository } from './postgres-distribution-log.repository';

describe('PostgresDistributionLogRepository', () => {
  let repository: PostgresDistributionLogRepository;
  let distributionLogModel: MockRepository;
  let distributionAttemptModel: MockRepository;
  let sequelize: MockSequelize;

  const log = {
    id: '32641f47-785e-4f43-8249-fff97e5009d0',
    state: MessageState.COMPLETED,
    attempts: 2,
  } as DistributionLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresDistributionLogRepository,
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

    repository = module.get<PostgresDistributionLogRepository>(
      PostgresDistributionLogRepository,
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

  describe('create()', () => {});

  describe('update()', () => {});
});
