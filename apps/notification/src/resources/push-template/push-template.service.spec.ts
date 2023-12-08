import { ExistsException, MissingException } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { createCacheStoreMock } from '../../../test/helpers/provider.helper';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';
import { PushTemplateService } from './push-template.service';

describe('PushTemplateService', () => {
  let service: PushTemplateService;
  let pushTemplateRepository: MockRepository;

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
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    service = module.get<PushTemplateService>(PushTemplateService);
    pushTemplateRepository = module.get<MockRepository>(
      getModelToken(PushTemplate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      pushTemplateRepository.find.mockClear();
    });

    it('should yield a list of push notification templates', async () => {
      // Arrange.
      const expectedResult: PushTemplate[] = [
        {
          title: 'unit-test',
        } as PushTemplate,
      ];
      pushTemplateRepository.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      pushTemplateRepository.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      pushTemplateRepository.findOne.mockClear();
    });

    it('should yield a push notification template', async () => {
      // Arrange.
      const expectedResult: PushTemplate = {
        name: 'unit-test',
        title: 'Unit Test',
      } as PushTemplate;
      pushTemplateRepository.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'unit-test';
      pushTemplateRepository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(name)).resolves.toBeNull();
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
      pushTemplateRepository.findOneBy.mockClear();
      pushTemplateRepository.create.mockClear();
      pushTemplateRepository.save.mockClear();
    });

    it('should create a push notification template', async () => {
      // Arrange.
      pushTemplateRepository.findOneBy.mockResolvedValue(null);
      pushTemplateRepository.create.mockResolvedValue(pushTemplate);

      // Act.
      await service.create(createPushTemplateDto);

      // Assert.
      expect(pushTemplateRepository.create).toHaveBeenCalledWith({
        ...createPushTemplateDto,
        actions: [],
      });
    });

    it('should yield the created push notification template', async () => {
      // Arrange.
      pushTemplateRepository.findOneBy.mockResolvedValue(null);
      pushTemplateRepository.create.mockResolvedValue(pushTemplate);
      pushTemplateRepository.save.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(service.create(createPushTemplateDto)).resolves.toEqual(
        pushTemplate,
      );
    });

    it('should throw a "ExistsException" if a push notification template already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
      pushTemplateRepository.findOneBy.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(service.create(createPushTemplateDto)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    it.todo('should update a push notification template (w/o actions)');

    it.todo('should update a push notification template (w/actions)');

    it.todo(
      'should yield an "ApiResponseDto" object with the updated push notification template',
    );

    it.todo(
      'should throw a "NotFoundException" if the repository returns null/undefined',
    );
  });

  describe('remove()', () => {
    const name = 'unit-test';
    const pushTemplate = { destroy: jest.fn() };

    afterEach(() => {
      pushTemplateRepository.findOneBy.mockClear();
      pushTemplateRepository.remove.mockClear();
    });

    it('should remove a push notification template', async () => {
      // Arrange.
      pushTemplateRepository.findOneBy.mockResolvedValue(pushTemplate);

      // Act.
      await service.remove(name);

      // Assert.
      expect(pushTemplateRepository.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      const expectedResult = new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
      pushTemplateRepository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});
