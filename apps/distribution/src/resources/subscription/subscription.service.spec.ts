import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { createMockRepository } from '../../../test/helpers/database.helpers';
import { createDistributionRuleServiceMock } from '../../../test/helpers/provider.helper';
import { DistributionRuleService } from '../distribution-rule/distribution-rule.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of subscriptions', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('findOne()', () => {
    it('should yield a subscription', () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('create()', () => {
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
