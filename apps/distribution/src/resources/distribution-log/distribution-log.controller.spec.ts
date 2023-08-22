import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionLogService,
  createDistributionLogServiceMock,
} from '../../../test/helpers/provider.helper';
import { MessageState } from '../../common/types/message-state.type';
import { DistributionLogController } from './distribution-log.controller';
import { DistributionLogService } from './distribution-log.service';
import { DistributionLog } from './entities/distribution-log.entity';

describe('DistributionLogController', () => {
  let controller: DistributionLogController;
  let service: MockDistributionLogService;

  const log = {
    id: '32641f47-785e-4f43-8249-fff97e5009d0',
    state: MessageState.COMPLETED,
    data: {},
    attempts: 2,
  } as DistributionLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionLogController],
      providers: [
        {
          provide: DistributionLogService,
          useValue: createDistributionLogServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<DistributionLogController>(
      DistributionLogController,
    );
    service = module.get<MockDistributionLogService>(DistributionLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of distribution logs', async () => {
      // Arrange.
      const expectedResult: DistributionLog[] = [log];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll(null, null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution logs not found!`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll(null, null, null)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution logs not found!`,
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll(null, null, null)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield a distribution log', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(log);

      // Act/Assert.
      await expect(controller.findOne('')).resolves.toEqual(log);
    });
  });

  it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
    // Arrange.
    const id = 'test';
    const expectedResult = new NotFoundException(
      `Distribution log with id=${id} not found!`,
    );
    service.findAll.mockResolvedValue(null);

    // Act/Assert.
    await expect(controller.findOne(id)).rejects.toEqual(expectedResult);
  });
});
