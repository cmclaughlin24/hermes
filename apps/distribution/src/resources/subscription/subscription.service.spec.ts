import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { FilterJoinOps, FilterOps } from '../../common/types/filter.type';
import { SubscriptionType } from '../../common/types/subscription-type.type';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { DistributionEvent } from '../distribution-event/repository/entities/distribution-event.entity';
import { DistributionRule } from '../distribution-rule/repository/entities/distribution-rule.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './repository/entities/subscription.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './repository/subscription.repository';

type MockSubscriptionRepository = Partial<
  Record<keyof SubscriptionRepository, jest.Mock>
>;

const createSubscriptionRepositoryMock = (): MockSubscriptionRepository => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  removeAll: jest.fn(),
  remove: jest.fn(),
});

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: MockSubscriptionRepository;
  let distributionEventService: MockDistributionEventService;

  const eventType = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: createSubscriptionRepositoryMock(),
        },
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repository = module.get<MockSubscriptionRepository>(SubscriptionRepository);
    distributionEventService = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.findAll.mockClear();
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
      repository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      repository.findOne.mockClear();
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
      repository.findOne.mockResolvedValue(expectedResult);

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
      repository.findOne.mockResolvedValue(null);

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
      repository.create.mockClear();
      distributionEventService.findOne.mockClear();
    });

    it('should create a subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionEvent);

      // Act.
      await service.create(createSubscriptionDto);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
    });

    it('should yield the created subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionEvent);
      repository.create.mockResolvedValue(subscription);

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
      repository.create.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const subscription = {};

    afterEach(() => {
      distributionEventService.findOne.mockClear();
      repository.update.mockClear();
    });

    it('should update a subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      repository.findOne.mockResolvedValue(subscription);

      // Act.
      await service.update(eventType, '', {} as UpdateSubscriptionDto);

      // Assert.
      expect(repository.update).toHaveBeenCalled();
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
          },
        ],
      };
      distributionEventService.findOne.mockResolvedValue({ id: 'unit-test' });
      repository.update.mockResolvedValue(subscription);

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
      repository.update.mockRejectedValue(expectedResult);

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
      repository.findOne.mockResolvedValue({});

      // Act.
      await service.removeAll(subscriberId);

      // Assert.
      expect(repository.removeAll).toHaveBeenCalledWith(subscriberId);
    });

    it('should throw a "MissingException" if the repository does have at least one subscription', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription(s) with subscriberId=${subscriberId} not found!`,
      );
      repository.removeAll.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.removeAll(subscriberId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    const subscriberId = '8544f373-8442-4307-aaa0-f26d4f7b30b1';
    const subscription = {};

    afterEach(() => {
      distributionEventService.findOne.mockClear();
    });

    it('should remove a subscription', async () => {
      // Arrange.
      repository.findOne.mockResolvedValue(subscription);
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);

      // Act.
      await service.remove(eventType, subscriberId);

      // Assert.
      expect(repository.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Subscription with eventType=${eventType} subscriberId=${subscriberId} not found!`,
      );
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      repository.remove.mockRejectedValue(expectedResult);

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
