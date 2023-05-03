import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helpers';
import { Subscription } from '../subscription/entities/subscription.entity';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

describe('DistributionRuleService', () => {
  let service: DistributionRuleService;
  let distributionRuleModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionRuleService,
        {
          provide: getModelToken(DistributionRule),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DistributionRuleService>(DistributionRuleService);
    distributionRuleModel = module.get<MockRepository>(
      getModelToken(DistributionRule),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      distributionRuleModel.findAll.mockClear();
    });

    it('should yield a list of distribution rules (w/o query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [
        {
          queue: 'unit-test',
          messageType: 'unit-test',
          deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
          emailTemplate: 'unit-test',
          checkDeliveryWindow: false,
        } as DistributionRule,
      ];
      distributionRuleModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toEqual(expectedResult);
    });

    it('should yield a filtered list of distribution rules (w/query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [
        {
          queue: 'unit-test',
          messageType: 'unit-test',
          deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
          emailTemplate: 'unit-test',
          checkDeliveryWindow: false,
        } as DistributionRule,
      ];
      distributionRuleModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(['unit-test'])).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution rules not found!`,
      );
      distributionRuleModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll(null)).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution rules not found!`,
      );
      distributionRuleModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null)).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      distributionRuleModel.findOne.mockClear();
    });

    it('should yield a distribution rule (w/o subscriptions)', async () => {
      // Arrange.
      const expectedResult: DistributionRule = {
        queue: 'unit-test',
        messageType: 'unit-test',
        deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
        emailTemplate: 'unit-test',
        checkDeliveryWindow: false,
      } as DistributionRule;
      distributionRuleModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne('', '')).resolves.toEqual(expectedResult);
    });

    it('should yield a distribution rule (w/subscriptions)', async () => {
      // Arrange.
      const expectedResult: DistributionRule = {
        queue: 'unit-test',
        messageType: 'unit-test',
        deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
        emailTemplate: 'unit-test',
        checkDeliveryWindow: false,
        subscriptions: [{} as Subscription],
      } as DistributionRule;
      distributionRuleModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne('', '', true)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const queue = 'unit-test';
      const messageType = 'unit-test';
      const expectedResult = new NotFoundException(
        `Distribution Rule for queue=${queue} messageType=${messageType} not found!`,
      );
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(queue, messageType)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('create()', () => {
    const createDistributionRuleDto: CreateDistributionRuleDto = {
      queue: 'unit-test',
      messageType: 'unit-test',
      deliveryMethods: [DeliveryMethods.EMAIL],
      text: 'This is a unit test.',
      checkDeliveryWindow: false,
    };
    const distributionRule = { ...createDistributionRuleDto };

    beforeEach(() => {
      distributionRuleModel.create.mockResolvedValue(distributionRule);
    });

    afterEach(() => {
      distributionRuleModel.create.mockClear();
    });

    it('should create a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act.
      await service.create(createDistributionRuleDto);

      // Assert.
      expect(distributionRuleModel.create).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object with the created distribution rule', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionRule>(
        `Successfully created distribution rule for queue=${distributionRule.queue} messageType=${distributionRule.messageType}!`,
        distributionRule,
      );
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.create(createDistributionRuleDto)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if a distribution rule already exists', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
        `Distribution Rule for queue=${createDistributionRuleDto.queue} messageType=${createDistributionRuleDto.messageType} already exists!`,
      );
      distributionRuleModel.findOne.mockResolvedValue({} as DistributionRule);

      // Act/Assert.
      await expect(service.create(createDistributionRuleDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    afterEach(() => {});

    it('should update a distribution rule', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should yield an "ApiResponseDto" object with the updated distribution rule', async () => {
      // Arrange.
      // Act/Assert.
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('remove()', () => {
    const distributionRule = { destroy: jest.fn() };
    const queue = 'unit-test';
    const messageType = 'unit-test';

    afterEach(() => {
      distributionRule.destroy.mockClear();
    });

    it('should remove a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(distributionRule);

      // Act.
      await service.remove('', '');

      // Assert.
      expect(distributionRule.destroy).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted distribution rule for queue=${queue} messageType=${messageType}!`,
      );
      distributionRuleModel.findOne.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(service.remove(queue, messageType)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution Rule for queue=${queue} messageType=${messageType} not found!`,
      );
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(queue, messageType)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
