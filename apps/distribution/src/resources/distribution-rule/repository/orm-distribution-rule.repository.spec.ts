import {
  DeliveryMethods,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { DefaultRuleException } from '../../../common/errors/default-rule.exception';
import { CreateDistributionRuleDto } from '../dto/create-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';
import { OrmDistributionRuleRepository } from './orm-distribution-rule.repository';

describe('PostgresDistributionRuleRepository', () => {
  let repository: OrmDistributionRuleRepository;
  let distributionRuleModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmDistributionRuleRepository,
        {
          provide: getRepositoryToken(DistributionRule),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<OrmDistributionRuleRepository>(
      OrmDistributionRuleRepository,
    );
    distributionRuleModel = module.get<MockRepository>(
      getRepositoryToken(DistributionRule),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    const distributionRule = {
      deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
      emailTemplate: 'unit-test',
      checkDeliveryWindow: false,
    } as DistributionRule;

    afterEach(() => {
      distributionRuleModel.find.mockClear();
    });

    it('should yield a list of distribution rules (w/o query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      distributionRuleModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(null)).resolves.toEqual(expectedResult);
    });

    it('should yield a filtered list of distribution rules (w/query params)', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      distributionRuleModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll(['unit-test'])).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      distributionRuleModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll(null)).resolves.toHaveLength(0);
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
      distributionRuleModel.findOne.mockClear();
    });

    it('should yield a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findOne(expectedResult.id)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(id)).resolves.toBeNull();
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
      distributionRuleModel.create.mockResolvedValue(distributionRule);
    });

    afterEach(() => {
      distributionRuleModel.create.mockClear();
    });

    it('should create a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(null);

      // Act.
      await repository.create(createDistributionRuleDto);

      // Assert.
      expect(distributionRuleModel.create).toHaveBeenCalled();
    });

    it('should yield the created distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOne.mockResolvedValue(null);
      distributionRuleModel.save.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(
        repository.create(createDistributionRuleDto),
      ).resolves.toEqual(distributionRule);
    });

    it('should thorow an "ExistsException" if a default distribution rule exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        'A default distribution rule already exists (metadata=null)!',
      );
      distributionRuleModel.findOne.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(
        repository.create(createDistributionRuleDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    const distributionRule = {
      eventType: 'bingo-heeler',
      metadata: null,
      deliveryMethods: [DeliveryMethods.EMAIL],
      text: 'Bingo is a red heeler mix from Bastrop, Texas.',
      checkDeliveryWindow: false,
    };

    afterEach(() => {
      distributionRuleModel.preload.mockClear();
    });

    it('should update a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.preload.mockResolvedValue(distributionRule);

      // Act.
      await repository.update('', {});

      // Assert.
      expect(distributionRuleModel.preload).toHaveBeenCalled();
    });

    it('should yield the updated distribution rule', async () => {
      // Arrange.
      distributionRuleModel.preload.mockResolvedValue(distributionRule);
      distributionRuleModel.save.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(repository.update('', {})).resolves.toEqual(
        distributionRule,
      );
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      const expectedResult = new MissingException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.preload.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.update(id, {})).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const distributionRule = { metadata: {} };
    const id = 'unit-test';

    afterEach(() => {
      distributionRuleModel.findOneBy.mockClear();
      distributionRuleModel.remove.mockClear();
      distributionRule.metadata = {};
    });

    it('should remove a distribution rule', async () => {
      // Arrange.
      distributionRuleModel.findOneBy.mockResolvedValue(distributionRule);

      // Act.
      await repository.remove(id);

      // Assert.
      expect(distributionRuleModel.remove).toHaveBeenCalled();
    });

    it('should throw a "DefaultRuleException" if the attempting to delete the default distribution rule', async () => {
      // Arrange.
      const expectedResult = new DefaultRuleException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
      distributionRule.metadata = null;
      distributionRuleModel.findOneBy.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(repository.remove(id)).rejects.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Distribution rule for id=${id} not found!`,
      );
      distributionRuleModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(id)).rejects.toEqual(expectedResult);
    });
  });
});
