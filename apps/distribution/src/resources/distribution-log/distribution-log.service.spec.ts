import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  createMockRepository,
  createMockSequelize,
} from '../../../test/helpers/database.helpers';
import { MessageState } from '../../common/types/message-state.types';
import { DistributionLogService } from './distribution-log.service';
import { DistributionAttempt } from './entities/distribution-attempt.entity';
import { DistributionLog } from './entities/distribution-log.entity';

describe('DistributionLogService', () => {
  let service: DistributionLogService;
  let distributionLogModel: MockRepository;

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

  describe('log()', () => {});
});
