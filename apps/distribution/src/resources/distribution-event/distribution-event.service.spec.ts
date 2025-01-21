import { ExistsException, MissingException } from '@hermes/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionRule } from '../distribution-rule/repository/entities/distribution-rule.entity';
import { SubscriptionFilter } from '../subscription/repository/entities/subscription-filter.entity';
import { Subscription } from '../subscription/repository/entities/subscription.entity';
import { DistributionEventService } from './distribution-event.service';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './repository/entities/distribution-event.entity';

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

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionEventModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(false, false)).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    const distributionEvent = {
      eventType: 'unit-test',
    } as DistributionEvent;

    afterEach(() => {
      distributionEventModel.findByPk.mockClear();
    });

    it('should yield a distribution event (w/o rules & subscriptions)', async () => {
      // Arrange.
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.findOne(distributionEvent.eventType),
      ).resolves.toEqual(distributionEvent);
    });

    it('should yield a distribution event (w/rules)', async () => {
      // Arrange.
      const expectedResult = {
        include: [{ model: DistributionRule }],
      };
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, true);

      // Assert.
      expect(distributionEventModel.findByPk).toHaveBeenCalledWith(
        distributionEvent.eventType,
        expectedResult,
      );
    });

    it('should yield a distribution event (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        include: [{ model: Subscription, include: [SubscriptionFilter] }],
      };
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, false, true);

      // Assert.
      await expect(distributionEventModel.findByPk).toHaveBeenCalledWith(
        distributionEvent.eventType,
        expectedResult,
      );
    });

    it('should yield a distribution event (w/rules & subscriptions)', async () => {
      // Arrange.
      const expectedResult = {
        include: [
          { model: DistributionRule },
          { model: Subscription, include: [SubscriptionFilter] },
        ],
      };
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act.
      await service.findOne(distributionEvent.eventType, true, true);

      // Assert.
      expect(distributionEventModel.findByPk).toHaveBeenCalledWith(
        distributionEvent.eventType,
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      distributionEventModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      expect(service.findOne(distributionEvent.eventType)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const distributionEvent = {
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

    it('should yield the created distribution event', async () => {
      // Arrange.
      distributionEventModel.create.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.create({
          rules: [{ metadata: null }],
        } as CreateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw an "ExistsException" if a distribution event already exists', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
      } as CreateDistributionEventDto;
      const expectedResult = new ExistsException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} already exists!`,
      );
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "DefaultRuleException" if a default distribution rule is not defined (w/rules equal to empty list)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
        rules: [],
      } as CreateDistributionEventDto;
      const expectedResult = new DefaultRuleException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "DefaultRuleException" if a default distribution rule is not defined (w/rules equal to null)', async () => {
      // Arrange.
      const createDistributionEventDto = {
        eventType: 'unit-test',
        rules: null,
      } as CreateDistributionEventDto;
      const expectedResult = new DefaultRuleException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );

      // Act/Assert.
      await expect(service.create(createDistributionEventDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const distributionEvent = { update: jest.fn() };
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEvent.update.mockClear();
      distributionEventModel.findByPk.mockClear();
    });

    it('should update a distribution event', async () => {
      // Arrange.
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act.
      await service.update(eventType, {} as UpdateDistributionEventDto);

      // Assert.
      expect(distributionEvent.update).toHaveBeenCalled();
    });

    it('should yield the updated distribution event', async () => {
      // Arrange.
      distributionEvent.update.mockResolvedValue(distributionEvent);
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act/Assert.
      await expect(
        service.update(eventType, {} as UpdateDistributionEventDto),
      ).resolves.toEqual(distributionEvent);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      distributionEventModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(eventType, {} as UpdateDistributionEventDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const distributionEvent = { destroy: jest.fn() };
    const eventType = 'unit-test';

    afterEach(() => {
      distributionEvent.destroy.mockClear();
    });

    it('should remove a distribution event', async () => {
      // Arrange.
      distributionEventModel.findByPk.mockResolvedValue(distributionEvent);

      // Act.
      await service.remove(eventType);

      // Assert.
      expect(distributionEvent.destroy).toHaveBeenCalled();
    });

    it('should yield a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${eventType} not found!`,
      );
      distributionEventModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove( eventType)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
