import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helpers';
import {
  MockDistributionRuleService,
  createDistributionRuleServiceMock,
} from '../../../test/helpers/provider.helper';
import { SubscriptionFilterJoinOps } from '../../common/constants/subscription-filter.constants';
import { DistributionRuleService } from '../distribution-rule/distribution-rule.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionModel: MockRepository;
  let distributionRuleService: MockDistributionRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getModelToken(Subscription),
          useValue: createMockRepository<Subscription>(),
        },
        {
          provide: DistributionRuleService,
          useValue: createDistributionRuleServiceMock(),
        },
        {
          provide: Sequelize,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionModel = module.get<MockRepository>(getModelToken(Subscription));
    distributionRuleService = module.get<MockDistributionRuleService>(
      DistributionRuleService,
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
          filterJoin: SubscriptionFilterJoinOps.AND,
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
        filterJoin: SubscriptionFilterJoinOps.AND,
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
        `Subscription with ${id} not found!`,
      );
      subscriptionModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    afterEach(() => {
      subscriptionModel.create.mockClear();
    });

    it('should create a subscription', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yeild an "ApiResponseDto" object with the created subscription', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('update()', () => {});

  describe('remove()', () => {
    afterEach(() => {
      subscriptionModel.destroy.mockClear();
    });

    it('should remove a subscription', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should yield an "ApiResponseDto" object', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });
});
