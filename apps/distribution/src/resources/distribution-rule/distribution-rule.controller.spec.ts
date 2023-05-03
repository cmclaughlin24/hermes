import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionRuleService,
  createDistributionRuleServiceMock,
} from '../../../test/helpers/provider.helper';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';

describe('DistributionRuleController', () => {
  let controller: DistributionRuleController;
  let service: MockDistributionRuleService;

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
      // Act/Assert.
    });
  });

  describe('findOne()', () => {
    it('should yield a distribution rule', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      // Act/Assert.
    });
  });
});
