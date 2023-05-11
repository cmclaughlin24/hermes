import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import {
  MockDistributionRuleService,
  createDistributionRuleServiceMock,
} from '../../../test/helpers/provider.helper';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

describe('DistributionRuleController', () => {
  let controller: DistributionRuleController;
  let service: MockDistributionRuleService;

  const distributionRule: DistributionRule = {
    id: '',
    distributionEventId: '',
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
    it('should yield a list of distribution rules', async () => {
      // Arrange.
      const expectedResult: DistributionRule[] = [distributionRule];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll([], [])).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield a distribution rule', async () => {
      // Arrange.
      const expectedResult: DistributionRule = distributionRule;
      service.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findOne('')).resolves.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const createDistributionRuleDto = {
        queue: 'unit-test',
        messageType: 'unit-test',
      } as CreateDistributionRuleDto;
      const expectedResult = new ApiResponseDto<DistributionRule>(
        `Successfully created distribution rule for queue=${createDistributionRuleDto.queue} messageType=${createDistributionRuleDto.messageType}!`,
        distributionRule,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreateDistributionRuleDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<DistributionRule>(
        `Successfully updated distribution rule!`,
        distributionRule,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update('', {} as UpdateDistributionRuleDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted distribution rule id=${distributionRule.id}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.remove('')).resolves.toEqual(expectedResult);
    });
  });
});
