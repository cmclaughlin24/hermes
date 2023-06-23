import { ApiResponseDto } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import {
    MockRepository,
    createMockRepository,
    createMockSequelize,
} from '../../../test/helpers/database.helper';
import { createCacheStoreMock } from '../../../test/helpers/provider.helper';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateService } from './push-template.service';

describe('PushTemplateService', () => {
  let service: PushTemplateService;
  let pushTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushTemplateService,
        {
          provide: getModelToken(PushTemplate),
          useValue: createMockRepository(),
        },
        {
          provide: getModelToken(PushAction),
          useValue: createMockRepository(),
        },
        {
          provide: Sequelize,
          useValue: createMockSequelize(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock()
        }
      ],
    }).compile();

    service = module.get<PushTemplateService>(PushTemplateService);
    pushTemplateModel = module.get<MockRepository>(getModelToken(PushTemplate));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      pushTemplateModel.findAll.mockClear();
    });

    it('should yield a list of push notification templates', async () => {
      // Arrange.
      const expectedResult: PushTemplate[] = [
        {
          title: 'unit-test',
        } as PushTemplate,
      ];
      pushTemplateModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Push Notification templates not found!',
      );
      pushTemplateModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        'Push Notification templates not found!',
      );
      pushTemplateModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      pushTemplateModel.findByPk.mockClear();
    });

    it('should yield a push notification template', async () => {
      // Arrange.
      const expectedResult: PushTemplate = {
        name: 'unit-test',
        title: 'Unit Test',
      } as PushTemplate;
      pushTemplateModel.findByPk.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'unit-test';
      const expectedResult = new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
      pushTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(name)).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    const createPushTemplateDto: CreatePushTemplateDto = {
      name: 'unit-test',
    };
    const pushTemplate = {
      name: 'unit-test',
      title: 'Unit Test',
    } as PushTemplate;

    afterEach(() => {
      pushTemplateModel.create.mockClear();
    });

    it('should create a push notification template', async () => {
      // Arrange.
      pushTemplateModel.findByPk.mockResolvedValue(null);
      pushTemplateModel.create.mockResolvedValue(pushTemplate);

      // Act.
      await service.create(createPushTemplateDto);

      // Assert.
      expect(pushTemplateModel.create).toHaveBeenCalledWith(
        createPushTemplateDto,
        { include: [PushAction] },
      );
    });

    it('should yield an "ApiResponseDto" object with the created push notification template', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<PushTemplate>(
        `Successfully created push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
      pushTemplateModel.findByPk.mockResolvedValue(null);
      pushTemplateModel.create.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(service.create(createPushTemplateDto)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "BadRequestException" if a push notification template already exists', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
      pushTemplateModel.findByPk.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(service.create(createPushTemplateDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    it.todo('should update a push notification template (w/o actions)');

    it.todo('should update a push notification template (w/actions)');

    it.todo('should yield an "ApiResponseDto" object with the updated push notification template');

    it.todo('should throw a "NotFoundException" if the repository returns null/undefined');
  });

  describe('remove()', () => {
    const name = 'unit-test';
    const pushTemplate = { destroy: jest.fn() };

    afterEach(() => {
      pushTemplate.destroy.mockClear();
    });

    it('should remove a push notification template', async () => {
      // Arrange.
      pushTemplateModel.findByPk.mockResolvedValue(pushTemplate);

      // Act.
      await service.remove(name);

      // Assert.
      expect(pushTemplate.destroy).toHaveBeenCalled();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted push notification template ${name}`,
      );
      pushTemplateModel.findByPk.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(service.remove(name)).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      const expectedResult = new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
      pushTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});
