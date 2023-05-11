import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helpers';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

describe('DistributionRuleService', () => {
  let service: DistributionRuleService;
  let distributionRuleModel: MockRepository;
  let distributionEventService: MockDistributionEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionRuleService,
        {
          provide: getModelToken(DistributionRule),
          useValue: createMockRepository(),
        },
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
      ],
    }).compile();

    service = module.get<DistributionRuleService>(DistributionRuleService);
    distributionRuleModel = module.get<MockRepository>(
      getModelToken(DistributionRule),
    );
    distributionEventService = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    const distributionRule = {
      deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
      emailTemplate: 'unit-test',
      checkDeliveryWindow: false,
    } as DistributionRule;

    afterEach(() => {
      distributionRuleModel.findAll.mockClear();
    });

    it('should yield a list of distribution rules (w/o query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      distributionRuleModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll(null, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a filtered list of distribution rules (w/query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      distributionRuleModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.findAll(['unit-test'], ['unit-test']),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution rules not found!`,
      );
      distributionRuleModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll(null, null)).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution rules not found!`,
      );
      distributionRuleModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null, null)).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    const expectedResult: DistributionRule = {
      id: 'unit-test',
      metadata: null,
      deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
      emailTemplate: 'unit-test',
      checkDeliveryWindow: false,
    } as DistributionRule;

    afterEach(() => {
      distributionRuleModel.findByPk.mockClear();
    });

    it('should yield a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findByPk.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(expectedResult.id)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      const expectedResult = new NotFoundException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const createDistributionRuleDto: CreateDistributionRuleDto = {
      queue: 'unit-test',
      messageType: 'unit-test',
      metadata: null,
      deliveryMethods: [DeliveryMethods.EMAIL],
      text: 'This is a unit test.',
      checkDeliveryWindow: false,
    };
    const distributionRule = { ...createDistributionRuleDto };

    beforeEach(() => {
      distributionEventService.findOne.mockResolvedValue({
        id: '',
        queue: createDistributionRuleDto.queue,
        messageType: createDistributionRuleDto.messageType,
      });
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
    const distributionRule = { destroy: jest.fn(), metadata: {} };
    const id = 'unit-test';

    afterEach(() => {
      distributionRule.destroy.mockClear();
      distributionRule.metadata = {};
    });

    it('should remove a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act.
      await service.remove(id);

      // Assert.
      expect(distributionRule.destroy).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted distribution rule id=${id}!`,
      );
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(service.remove(id)).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if the attempting to delete the default distribution rule', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
      distributionRule.metadata = null;
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(service.remove(id)).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(id)).rejects.toEqual(expectedResult);
    });
  });
});
