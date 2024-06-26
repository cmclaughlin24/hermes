import {
  DeliveryMethods,
  MissingException
} from '@hermes/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import {
  MockDistributionEventService,
  createDistributionEventServiceMock,
} from '../../../test/helpers/provider.helper';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
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
      await expect(service.findAll(null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a filtered list of distribution rules (w/query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      distributionRuleModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.findAll(['unit-test']),
      ).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionRuleModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(null)).resolves.toHaveLength(0);
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

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      distributionRuleModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const createDistributionRuleDto: CreateDistributionRuleDto = {
      eventType: 'unit-test',
      metadata: null,
      deliveryMethods: [DeliveryMethods.EMAIL],
      text: 'This is a unit test.',
      checkDeliveryWindow: false,
    };
    const distributionRule = { ...createDistributionRuleDto };

    beforeEach(() => {
      distributionEventService.findOne.mockResolvedValue({
        eventType: createDistributionRuleDto.eventType,
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

    it('should yield the created distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.create(createDistributionRuleDto)).resolves.toEqual(
        distributionRule,
      );
    });

    it('should throw a "MissingException" if the distribution event does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution Event for eventType=${createDistributionRuleDto.eventType} not found!`,
      );
      distributionEventService.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.create(createDistributionRuleDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const distributionRule = { update: jest.fn(() => distributionRule) };

    afterEach(() => {
      distributionRule.update.mockClear();
    });

    it('should update a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act.
      await service.update('', {});

      // Assert.
      await expect(distributionRule.update).toHaveBeenCalled();
    });

    it('should yield the updated distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(service.update('', {})).resolves.toEqual(distributionRule);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      const expectedResult = new MissingException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.update(id, {})).rejects.toEqual(expectedResult);
    });

    it('should throw a "DefaultRuleException" if attempting to modify the default rule\'s metadata property', async () => {
      // Arrange.
      const expectedResult = new DefaultRuleException(
        'The metadata for a default distribution rule must be set to null',
      );
      distributionRuleModel.findByPk.mockResolvedValue({
        ...distributionRule,
        metadata: null,
      });

      // Act/Assert.
      await expect(
        service.update('', { metadata: '{"name":"unit-test"}' }),
      ).rejects.toEqual(expectedResult);
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

    it('should throw a "DefaultRuleException" if the attempting to delete the default distribution rule', async () => {
      // Arrange.
      const expectedResult = new DefaultRuleException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
      distributionRule.metadata = null;
      distributionRuleModel.findByPk.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(service.remove(id)).rejects.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(id)).rejects.toEqual(expectedResult);
    });
  });
});
