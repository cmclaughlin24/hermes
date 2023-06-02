import { ApiResponseDto } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockPushTemplateService,
  createPushTemplateServiceMock,
} from '../../../test/helpers/provider.helpers';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';

describe('PushTemplateController', () => {
  let controller: PushTemplateController;
  let service: MockPushTemplateService;

  const pushTemplate: PushTemplate = {
    name: 'test',
    title: 'Unit Test',
  } as PushTemplate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushTemplateController],
      providers: [
        {
          provide: PushTemplateService,
          useValue: createPushTemplateServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<PushTemplateController>(PushTemplateController);
    service = module.get<MockPushTemplateService>(PushTemplateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should yield a list of email templates', async () => {
      // Arrange.
      const expectedResult: PushTemplate[] = [pushTemplate];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield an email template', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(controller.findOne(pushTemplate.name)).resolves.toEqual(
        pushTemplate,
      );
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully created push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreatePushTemplateDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully updated push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update(pushTemplate.name, {} as UpdatePushTemplateDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully deleted email template ${pushTemplate.name}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.remove(pushTemplate.name)).resolves.toEqual(
        expectedResult,
      );
    });
  });
});
