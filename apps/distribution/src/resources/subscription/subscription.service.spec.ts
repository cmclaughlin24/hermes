import { ExistsException, MissingException } from '@hermes/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  MockSequelize,
  createMockRepository,
  createMockSequelize,
} from '../../../test/helpers/database.helper';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { FilterJoinOps, FilterOps } from '../../common/types/filter.type';
import { SubscriptionType } from '../../common/types/subscription-type.type';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { DistributionEvent } from '../distribution-event/entities/distribution-event.entity';
import { DistributionRule } from '../distribution-rule/entities/distribution-rule.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionModel: MockRepository;
  let subscriptionFilterModel: MockRepository;
  let distributionEventService: MockDistributionEventService;
  let sequelize: MockSequelize;

  const eventType = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getModelToken(Subscription),
          useValue: createMockRepository<Subscription>(),
        },
        {
          provide: getModelToken(SubscriptionFilter),
          useValue: createMockRepository<SubscriptionFilter>(),
        },
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
        {
          provide: Sequelize,
          useValue: createMockSequelize(),
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionModel = module.get<MockRepository>(getModelToken(Subscription));
    subscriptionFilterModel = module.get<MockRepository>(
      getModelToken(SubscriptionFilter),
    );
    distributionEventService = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
    sequelize = module.get<MockSequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      subscriptionModel.findAll.mockClear();
    });

    it('should yield a list of subscriptions', async () => {
      // Arrange.
      const expectedResult: Subscription[] = [
        {
          id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
          filterJoin: FilterJoinOps.AND,
          data: { url: 'http://localhost:9999/subscriptions' },
        } as Subscription,
      ];
      subscriptionModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      subscriptionModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      subscriptionModel.findByPk.mockClear();
      distributionEventService.findOne.mockClear();
    });

    it('should yield a subscription', async () => {
      // Arrange.
      const expectedResult: Subscription = {
        id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
        filterJoin: FilterJoinOps.AND,
        data: { url: 'http://localhost:9999/subscriptions' },
      } as Subscription;
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(eventType, '')).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository return null/undefined', async () => {
      // Arrange.
      const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';

      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.findOne(eventType, subscriberId),
      ).resolves.toBeNull();
    });

    it('should throw a "MissingException" if the distribution event does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Rule for eventType=${eventType} not found!`,
      );
      distributionEventService.findOne.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(eventType, '')).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('create()', () => {
    const createSubscriptionDto: CreateSubscriptionDto = {
      subscriberId: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
      filterJoin: FilterJoinOps.NOT,
      eventType: 'test',
      subscriptionType: SubscriptionType.REQUEST,
      data: { url: 'http://localhost:9999/subscriptions' },
    };
    const subscription = {
      subscriberId: createSubscriptionDto.subscriberId,
      distributionEventType: '',
      filterJoin: createSubscriptionDto.filterJoin,
      data: { url: 'http://localhost:9999/subscriptions' },
    } as Subscription;

    afterEach(() => {
      subscriptionModel.create.mockClear();
      distributionEventService.findOne.mockClear();
    });

    it('should create a subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionEvent);
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act.
      await service.create(createSubscriptionDto);

      // Assert.
      expect(subscriptionModel.create).toHaveBeenCalled();
    });

    it('should yield the created subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionEvent);
      subscriptionModel.findByPk.mockResolvedValue(null);
      subscriptionModel.create.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).resolves.toEqual(
        subscription,
      );
    });

    it('should throw a "MissingException" if the distribution event does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Rule for eventType=${createSubscriptionDto.eventType} not found!`,
      );
      distributionEventService.findOne.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "ExistsException" if a subscription already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Subscription ${createSubscriptionDto.subscriberId} already exists!`,
      );
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findOne.mockResolvedValue({} as Subscription);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const subscription = { update: jest.fn() };

    beforeEach(() => {
      sequelize.transaction.mockImplementation((callback) => callback());
    });

    afterEach(() => {
      distributionEventService.findOne.mockClear();
      subscriptionModel.findOne.mockClear();
      subscription.update.mockClear();
    });

    it('should update a subscription (w/o filters)', async () => {
      // Arrange.
      const subscription = { update: jest.fn() };
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act.
      await service.update(eventType, '', {} as UpdateSubscriptionDto);

      // Assert.
      expect(subscription.update).toHaveBeenCalled();
    });

    it('should update the subscription (w/filters)', async () => {
      // Arrange.
      const subscription = {
        filters: [],
        update: jest.fn(() => subscription),
        reload: jest.fn(),
      };
      const filters: SubscriptionFilterDto[] = [
        {
          field: 'unit-test',
          operator: FilterOps.EQUALS,
          value: 'Legend of Zelda: Tears of the Kingdom',
          dataType: 'string',
        },
      ];
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act.
      await service.update(eventType, '', {
        filters,
      } as UpdateSubscriptionDto);

      // Assert.
      expect(subscription.update).toHaveBeenCalled();
      expect(subscriptionFilterModel.create).toHaveBeenCalled();
    });

    it('should yield the updated subscription', async () => {
      // Arrange.
      const subscription = {
        filters: [
          {
            field: 'unit-test',
            operator: FilterOps.EQUALS,
            value: 'Legend of Zelda: Tears of the Kingdom',
            dataType: 'string',
            destroy: jest.fn(),
          },
        ],
        update: jest.fn(() => subscription),
        reload: jest.fn(() => subscription),
      };
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(
        service.update(eventType, '', {
          filters: [],
        } as UpdateSubscriptionDto),
      ).resolves.toEqual(subscription);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const subscriberId = 'unit-test';
      const expectedResult = new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(eventType, subscriberId, {} as UpdateSubscriptionDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the distribution event does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Rule for eventType=${eventType} not found!`,
      );
      distributionEventService.findOne.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.update(eventType, '', {} as UpdateSubscriptionDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('removeAll()', () => {
    const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';

    it('should remove a subscription from all distribution event(s)', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue({});

      // Act.
      await service.removeAll(subscriberId);

      // Assert.
      expect(subscriptionModel.destroy).toHaveBeenCalledWith({
        where: { subscriberId },
      });
    });

    it('should throw a "MissingException" if the repository does have at least one subscription', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.removeAll(subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';
    const subscription = { destroy: jest.fn() };

    afterEach(() => {
      subscription.destroy.mockClear();
      distributionEventService.findOne.mockClear();
    });

    it('should remove a subscription', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue(subscription);
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);

      // Act.
      await service.remove(eventType, subscriberId);

      // Assert.
      expect(subscription.destroy).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(eventType, subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the distribution event does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Rule for eventType=${eventType} not found!`,
      );
      distributionEventService.findOne.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(eventType, subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
