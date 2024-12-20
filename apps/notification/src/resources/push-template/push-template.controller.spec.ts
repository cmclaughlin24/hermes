import {
  ApiResponseDto,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockPushTemplateService,
  createPushTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplateController } from './push-template.controller';
import { PushTemplateService } from './push-template.service';
import { PushTemplate } from '../../infrastructure/persistance/postgres/entities/push-template.entity';

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
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of email templates', async () => {
      // Arrange.
      const expectedResult: PushTemplate[] = [pushTemplate];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Push Notification templates not found!',
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Push Notification templates not found!',
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield an email template', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(controller.findOne(pushTemplate.name)).resolves.toEqual(
        pushTemplate,
      );
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Push Notification Template with ${pushTemplate.name} not found!`,
      );
      service.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findOne(pushTemplate.name)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('create()', () => {
    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully created push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
      service.create.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(
        controller.create({} as CreatePushTemplateDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if the push template already exists', async () => {
      // Arrange.
      const errorMessage = `Push Notification Template ${pushTemplate.name} already exists!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({} as CreatePushTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully updated push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
      service.update.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(
        controller.update(pushTemplate.name, {} as UpdatePushTemplateDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if a push notification template does not exist', async () => {
      // Arrange.
      const errorMessage = `Push Notification Template ${pushTemplate.name} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(pushTemplate.name, {} as UpdatePushTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully deleted push notification template ${pushTemplate.name}!`,
      );
      service.remove.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.remove(pushTemplate.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if a push notification template does not exist', async () => {
      // Arrange.
      const errorMessage = `Push Notification Template ${pushTemplate.name} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(controller.remove(pushTemplate.name)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
