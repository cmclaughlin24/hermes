import {
    ApiResponseDto,
    DeliveryMethods,
    ExistsException,
    MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    MockDistributionRuleService,
    createDistributionRuleServiceMock,
} from '../../../test/helpers/provider.helper';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './repository/entities/distribution-rule.entity';

describe('DistributionRuleController', () => {
  let controller: DistributionRuleController;
  let service: MockDistributionRuleService;

  const distributionRule: DistributionRule = {
    id: '',
    distributionEventType: '',
    emailTemplate: 'unit-test',
    deliveryMethods: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
    checkDeliveryWindow: false,
  } as DistributionRule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionRuleController],
      providers: [
        {
          provide: DistributionRuleService,
          useValue: createDistributionRuleServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<DistributionRuleController>(
      DistributionRuleController,
    );
    service = module.get<MockDistributionRuleService>(DistributionRuleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of distribution rules', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll([])).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Distribution rules not found!',
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll([])).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Distribution rules not found!',
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll([])).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield a distribution rule', async () => {
      // Arrange.
      const expectedResult: DistributionRule = distributionRule;
      service.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findOne('')).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const id = 'unit-test';
      const expectedResult = new NotFoundException(
        `Distribution rule for id=${id} not found!`,
      );
      service.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findOne(id)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const createDistributionRuleDto = {
      eventType: 'unit-test',
    } as CreateDistributionRuleDto;

    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionRule>(
        `Successfully created distribution rule for eventType=${createDistributionRuleDto.eventType}!`,
        distributionRule,
      );
      service.create.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(
        controller.create(createDistributionRuleDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a distribution event does not exist', async () => {
      // Arrange.
      const errorMessage = `Distribution Event for eventType=${createDistributionRuleDto.eventType} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.create.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({} as CreateDistributionRuleDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if a distribution rule already exists', async () => {
      // Arrange.
      const errorMessage =
        'A default distribution rule already exists (metadata=null)!';
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({} as CreateDistributionRuleDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionRule>(
        `Successfully updated distribution rule!`,
        distributionRule,
      );
      service.update.mockResolvedValue(distributionRule);

      // Act/Assert.
      await expect(
        controller.update('', {} as UpdateDistributionRuleDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the distribution rule does not exist', async () => {
      // Arrange.
      const id = 'unit-test';
      const errorMessage = `Distribution rule for id=${id} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(id, {} as UpdateDistributionRuleDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" when modifying the default distribution rule metadata', async () => {
      // Arrange.
      const id = 'unit-test';
      const errorMessage =
        'The metadata for a default distribution rule must be set to null';
      const expectedResult = new BadRequestException(errorMessage);
      service.update.mockRejectedValue(new DefaultRuleException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(id, {} as UpdateDistributionRuleDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted distribution rule id=${distributionRule.id}!`,
      );
      service.remove.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.remove('')).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the distribution rule does not exist', async () => {
      // Arrange.
      const id = 'unit-test';
      const errorMessage = `Distribution rule for id=${id} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(controller.remove(id)).rejects.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" when attempting to delete the default distribution rule', async () => {
      // Arrange.
      const id = 'unit-test';
      const errorMessage = `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.remove.mockRejectedValue(new DefaultRuleException(errorMessage));

      // Act/Assert.
      await expect(controller.remove(id)).rejects.toEqual(expectedResult);
    });
  });
});
