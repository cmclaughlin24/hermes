import { ExistsException, MissingException } from '@hermes/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { OrmPushTemplateRepository } from './orm-push-template.repository';
import { PushTemplate } from './entities/push-template.entity';
import { PushAction } from './entities/push-action.entity';
import { CreatePushTemplateDto } from '../dto/create-push-template.dto';

describe('OrmPushTemplateRepository', () => {
  let repository: OrmPushTemplateRepository;
  let pushTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmPushTemplateRepository,
        {
          provide: getModelToken(PushTemplate),
          useValue: createMockRepository(),
        },
        {
          provide: getModelToken(PushAction),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<OrmPushTemplateRepository>(
      OrmPushTemplateRepository,
    );
    pushTemplateModel = module.get<MockRepository>(getModelToken(PushTemplate));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      pushTemplateModel.find.mockClear();
    });

    it('should yield a list of push notification templates', async () => {
      // Arrange.
      const expectedResult: PushTemplate[] = [
        {
          title: 'unit-test',
        } as PushTemplate,
      ];
      pushTemplateModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      pushTemplateModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      pushTemplateModel.findOne.mockClear();
    });

    it('should yield a push notification template', async () => {
      // Arrange.
      const expectedResult: PushTemplate = {
        name: 'unit-test',
        title: 'Unit Test',
      } as PushTemplate;
      pushTemplateModel.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findOne(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'unit-test';
      pushTemplateModel.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(name)).resolves.toBeNull();
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
      pushTemplateModel.findOneBy.mockClear();
      pushTemplateModel.create.mockClear();
      pushTemplateModel.save.mockClear();
    });

    it('should create a push notification template', async () => {
      // Arrange.
      pushTemplateModel.findOneBy.mockResolvedValue(null);
      pushTemplateModel.create.mockResolvedValue(pushTemplate);

      // Act.
      await repository.create(createPushTemplateDto);

      // Assert.
      expect(pushTemplateModel.create).toHaveBeenCalledWith({
        ...createPushTemplateDto,
        actions: [],
      });
    });

    it('should yield the created push notification template', async () => {
      // Arrange.
      pushTemplateModel.findOneBy.mockResolvedValue(null);
      pushTemplateModel.create.mockResolvedValue(pushTemplate);
      pushTemplateModel.save.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(repository.create(createPushTemplateDto)).resolves.toEqual(
        pushTemplate,
      );
    });

    it('should throw a "ExistsException" if a push notification template already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
      pushTemplateModel.findOneBy.mockResolvedValue(pushTemplate);

      // Act/Assert.
      await expect(repository.create(createPushTemplateDto)).rejects.toEqual(
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
      pushTemplateModel.findOneBy.mockClear();
      pushTemplateModel.remove.mockClear();
    });

    it('should remove a push notification template', async () => {
      // Arrange.
      pushTemplateModel.findOneBy.mockResolvedValue(pushTemplate);

      // Act.
      await repository.remove(name);

      // Assert.
      expect(pushTemplateModel.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      const expectedResult = new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
      pushTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});

