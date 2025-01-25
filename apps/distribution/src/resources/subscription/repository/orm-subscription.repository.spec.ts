import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { FilterJoinOps, FilterOps } from '../../../common/types/filter.type';
import { SubscriptionType } from '../../../common/types/subscription-type.type';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { SubscriptionFilterDto } from '../dto/subscription-filter.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { OrmSubscriptionRepository } from './orm-subscription.repository';

describe('PostgresSubscriptionRepository', () => {
  let repository: OrmSubscriptionRepository;
  let subscriptionModel: MockRepository;
  let subscriptionFilterModel: MockRepository;

  const eventType = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmSubscriptionRepository,
        {
          provide: getRepositoryToken(Subscription),
          useValue: createMockRepository<Subscription>(),
        },
        {
          provide: getRepositoryToken(SubscriptionFilter),
          useValue: createMockRepository<SubscriptionFilter>(),
        },
      ],
    }).compile();

    repository = module.get<OrmSubscriptionRepository>(
      OrmSubscriptionRepository,
    );
    subscriptionModel = module.get<MockRepository>(
      getRepositoryToken(Subscription),
    );
    subscriptionFilterModel = module.get<MockRepository>(
      getRepositoryToken(SubscriptionFilter),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      subscriptionModel.find.mockClear();
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
      subscriptionModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      subscriptionModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      subscriptionModel.findOne.mockClear();
    });

    it('should yield a subscription', async () => {
      // Arrange.
      const expectedResult: Subscription = {
        id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
        filterJoin: FilterJoinOps.AND,
        data: { url: 'http://localhost:9999/subscriptions' },
      } as Subscription;
      subscriptionModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findOne(eventType, '')).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository return null/undefined', async () => {
      // Arrange.
      const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';

      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.findOne(eventType, subscriberId),
      ).resolves.toBeNull();
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
      subscriptionModel.save.mockClear();
    });

    it('should create a subscription', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act.
      await repository.create(createSubscriptionDto);

      // Assert.
      expect(subscriptionModel.create).toHaveBeenCalled();
    });

    it('should yield the created subscription', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue(null);
      subscriptionModel.create.mockResolvedValue(subscription);
      subscriptionModel.save.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(repository.create(createSubscriptionDto)).resolves.toEqual(
        subscription,
      );
    });

    it('should throw a "ExistsException" if a subscription already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Subscription ${createSubscriptionDto.subscriberId} already exists!`,
      );
      subscriptionModel.findOne.mockResolvedValue({} as Subscription);

      // Act/Assert.
      await expect(repository.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const subscription = {};

    afterEach(() => {
      subscriptionModel.findOne.mockClear();
      subscriptionModel.save.mockClear();
    });

    it('should update a subscription (w/o filters)', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act.
      await repository.update(eventType, '', {} as UpdateSubscriptionDto);

      // Assert.
      expect(subscriptionModel.save).toHaveBeenCalled();
    });

    it('should update the subscription (w/filters)', async () => {
      // Arrange.
      const subscription = {
        filters: [],
      };
      const filters: SubscriptionFilterDto[] = [
        {
          field: 'unit-test',
          operator: FilterOps.EQUALS,
          value: 'Legend of Zelda: Tears of the Kingdom',
          dataType: 'string',
        },
      ];
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act.
      await repository.update(eventType, '', {
        filters,
      } as UpdateSubscriptionDto);

      // Assert.
      expect(subscriptionModel.save).toHaveBeenCalled();
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
      };
      subscriptionModel.findOne.mockResolvedValue(subscription);
      subscriptionModel.save.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(
        repository.update(eventType, '', {
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
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.update(eventType, subscriberId, {} as UpdateSubscriptionDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('removeAll()', () => {
    const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';

    it('should remove a subscription from all distribution event(s)', async () => {
      // Arrange.
      const expectedResult = [{} as Subscription];
      subscriptionModel.find.mockResolvedValue(expectedResult);

      // Act.
      await repository.removeAll(subscriberId);

      // Assert.
      expect(subscriptionModel.remove).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw a "MissingException" if the repository does have at least one subscription (empty list)', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
      subscriptionModel.findOne.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.removeAll(subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the repository does have at least one subscription (null/undefined)', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.removeAll(subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';
    const subscription = {};

    afterEach(() => {
      subscriptionModel.remove.mockClear();
    });

    it('should remove a subscription', async () => {
      // Arrange.
      subscriptionModel.findOne.mockResolvedValue(subscription);

      // Act.
      await repository.remove(eventType, subscriberId);

      // Assert.
      expect(subscriptionModel.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
      subscriptionModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(eventType, subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
