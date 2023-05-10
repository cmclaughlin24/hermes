import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  createMockRepository,
  createMockSequelize,
} from '../../../test/helpers/database.helpers';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { FilterJoinOps } from '../../common/types/filter.types';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { DistributionRule } from '../distribution-rule/entities/distribution-rule.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionModel: MockRepository;
  let distributionEventService: MockDistributionEventService;

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
    distributionEventService = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
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
          url: 'http://localhost:9999/subscriptions',
        } as Subscription,
      ];
      subscriptionModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(`Subscriptions not found!`);
      subscriptionModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(`Subscriptions not found!`);
      subscriptionModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      subscriptionModel.findByPk.mockClear();
    });

    it('should yield a subscription', async () => {
      // Arrange.
      const expectedResult: Subscription = {
        id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
        filterJoin: FilterJoinOps.AND,
        url: 'http://localhost:9999/subscriptions',
      } as Subscription;
      subscriptionModel.findByPk.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne('')).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const id = '8544f373-8442-4307-aaa0-f26d4f7b30b1';
      const expectedResult = new NotFoundException(
        `Subscription with id=${id} not found!`,
      );
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const createSubscriptionDto: CreateSubscriptionDto = {
      id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
      filterJoin: FilterJoinOps.NOT,
      queue: 'distribution',
      messageType: 'test',
      url: 'http://localhost:9999/subscriptions',
    };
    const subscription = {
      id: createSubscriptionDto.id,
      distributionEventId: '',
      filterJoin: createSubscriptionDto.filterJoin,
      url: createSubscriptionDto.url,
    } as Subscription;

    afterEach(() => {
      subscriptionModel.create.mockClear();
    });

    it('should create a subscription', async () => {
      // Arrange.
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act.
      await service.create(createSubscriptionDto);

      // Assert.
      expect(subscriptionModel.create).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object with the created subscription', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully created subscription!`,
        subscription,
      );
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findByPk.mockResolvedValue(null);
      subscriptionModel.create.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundExcpetion" if the distribution rule does not exist', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Rule for queue=${createSubscriptionDto.queue} messageType=${createSubscriptionDto.messageType} not found!`,
      );
      distributionEventService.findOne.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if a subscription already exists', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
        `Subscription ${createSubscriptionDto.id} already exists!`,
      );
      distributionEventService.findOne.mockResolvedValue({
        id: 'test',
      } as DistributionRule);
      subscriptionModel.findByPk.mockResolvedValue({} as Subscription);

      // Act/Assert.
      await expect(service.create(createSubscriptionDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {});

  describe('remove()', () => {
    const id = '8544f373-8442-4307-aaa0-f26d4f7b30b1';
    const subscription = { destroy: jest.fn() };

    afterEach(() => {
      subscription.destroy.mockClear();
    });

    it('should remove a subscription', async () => {
      // Arrange.
      subscriptionModel.findByPk.mockResolvedValue(subscription);

      // Act.
      await service.remove(id);

      // Assert.
      expect(subscription.destroy).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted subscription ${id}!`,
      );
      subscriptionModel.findByPk.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(service.remove(id)).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Subscription with id=${id} not found!`,
      );
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(id)).rejects.toEqual(expectedResult);
    });
  });
});
