import { ApiResponseDto } from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { DistributionRule } from '../distribution-rule/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../subscription/entities/subscription-filter.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

describe('DistributionEventService', () => {
  let service: DistributionEventService;
  let distributionEventModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionEventService,
        {
          provide: getModelToken(DistributionEvent),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DistributionEventService>(DistributionEventService);
    distributionEventModel = module.get<MockRepository>(
      getModelToken(DistributionEvent),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const distributionEvent = {
      id: 'unit-test',
      queue: 'unit-test',
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      distributionEventModel.findAll.mockClear();
    });

    it('should yield a list of distribution events (w/o rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = [distributionEvent];
      distributionEventModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(false, false)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a list of distribution events (w/rules)', async () => {
      // Arrange.
      const expectedResult = {
        include: [{ model: DistributionRule }],
      };
      distributionEventModel.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(true, false);

      // Assert.
      expect(distributionEventModel.findAll).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a list of distribution events (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        include: [{ model: Subscription, include: [SubscriptionFilter] }],
      };
      distributionEventModel.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(false, true);

      // Assert.
      expect(distributionEventModel.findAll).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a list of distribution events (w/rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        include: [
          { model: DistributionRule },
          { model: Subscription, include: [SubscriptionFilter] },
        ],
      };
      distributionEventModel.findAll.mockResolvedValue([distributionEvent]);

      // Act
      await service.findAll(true, true);

      // Assert.
      expect(distributionEventModel.findAll).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Distribution events not found!',
      );
      distributionEventModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll(false, false)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Distribution events not found!',
      );
      distributionEventModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(false, false)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne()', () => {
    const distributionEvent = {
      id: 'unit-test',
      queue: 'unit-test',
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      distributionEventModel.findOne.mockClear();
    });

    it('should yield a distribution event (w/o rules & subscriptions)', async () => {
      // Arrange.
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.findOne(distributionEvent.queue, distributionEvent.eventType),
      ).resolves.toEqual(distributionEvent);
    });

    it('should yield a distribution event (w/rules)', async () => {
      // Arrange.
      const expectedResult = {
        where: {
          queue: distributionEvent.queue,
          eventType: distributionEvent.eventType,
        },
        include: [{ model: DistributionRule }],
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(
        distributionEvent.queue,
        distributionEvent.eventType,
        true,
      );

      // Assert.
      expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a distribution event (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        where: {
          queue: distributionEvent.queue,
          eventType: distributionEvent.eventType,
        },
        include: [{ model: Subscription, include: [SubscriptionFilter] }],
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(
        distributionEvent.queue,
        distributionEvent.eventType,
        false,
        true,
      );

      // Assert.
      await expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a distribution event (w/rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        where: {
          queue: distributionEvent.queue,
          eventType: distributionEvent.eventType,
        },
        include: [
          { model: DistributionRule },
          { model: Subscription, include: [SubscriptionFilter] },
        ],
      };
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(
        distributionEvent.queue,
        distributionEvent.eventType,
        true,
        true,
      );

      // Assert.
      expect(distributionEventModel.findOne).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Event for queue=${distributionEvent.queue} eventType=${distributionEvent.eventType} not found!`,
      );
      distributionEventModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      expect(
        service.findOne(distributionEvent.queue, distributionEvent.eventType),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const distributionEvent = {
      queue: 'unit-test',
      eventType: 'unit-test',
    };

    afterEach(() => {
      distributionEventModel.create.mockClear();
    });

    it('should create a distribution event', async () => {
      // Arrange.
      distributionEventModel.create.mockResolvedValue(distributionEvent);

      // Act.
      await service.create({
        rules: [{ metadata: null }],
      } as CreateDistributionEventDto);

      // Assert.
      expect(distributionEventModel.create).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object with the create distribution event', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully created distribution rule for queue=${distributionEvent.queue} eventType=${distributionEvent.eventType}!`,
        distributionEvent,
      );
      distributionEventModel.create.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.create({
          rules: [{ metadata: null }],
        } as CreateDistributionEventDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if a distribution event already exists', async () => {
      // Arrange.
      const createDistributionEventDto = {
        queue: 'unit-test',
        eventType: 'unit-test',
      } as CreateDistributionEventDto;
      const expectedResult = new BadRequestException(
        `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} already exists!`,
      );
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if a default distribution rule is not defined (w/rules equal to empty list)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        queue: 'unit-test',
        eventType: 'unit-test',
        rules: [],
      } as CreateDistributionEventDto;
      const expectedResult = new BadRequestException(
        `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if a default distribution rule is not defined (w/rules equal to null)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        queue: 'unit-test',
        eventType: 'unit-test',
        rules: null,
      } as CreateDistributionEventDto;
      const expectedResult = new BadRequestException(
        `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const distributionEvent = { update: jest.fn() };
    const queue = 'unit-test';
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEvent.update.mockClear();
    });

    it('should update a distribution event', async () => {
      // Arrange.
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.update(
        queue,
        eventType,
        {} as UpdateDistributionEventDto,
      );

      // Assert.
      expect(distributionEvent.update).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionEvent>(
        `Successfully updated distribution event for queue=${queue} eventType=${eventType}!`,
        distributionEvent,
      );
      distributionEvent.update.mockResolvedValue(distributionEvent);
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.update(queue, eventType, {} as UpdateDistributionEventDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Event for queue=${queue} eventType=${eventType} not found!`,
      );
      distributionEventModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(queue, eventType, {} as UpdateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const distributionEvent = { destroy: jest.fn() };
    const queue = 'unit-test';
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEvent.destroy.mockClear();
    });

    it('should remove a distribution event', async () => {
      // Arrange.
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act.
      await service.remove(queue, eventType);

      // Assert.
      expect(distributionEvent.destroy).toHaveBeenCalled();
    });

    it('should yield an "ApiResposneDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted distribution event for queue=${queue} eventType=${eventType}!`,
      );
      distributionEventModel.findOne.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(service.remove(queue, eventType)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Event for queue=${queue} eventType=${eventType} not found!`,
      );
      distributionEventModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(queue, eventType)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
