import { ExistsException, MissingException } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgresEmailTemplateRepository } from './email-template.repository';
import {
  createMockRepository,
  MockRepository,
} from '../../../../../test/helpers/database.helper';
import { EmailTemplate } from '../entities/email-template.entity';
import { createCacheStoreMock } from '../../../../../test/helpers/provider.helper';
import { CreateEmailTemplateDto } from '../../../../resources/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../../../../resources/email-template/dto/update-email-template.dto';

describe('PostgresEmailTemplateRepository', () => {
  let repository: PostgresEmailTemplateRepository;
  let emailTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresEmailTemplateRepository,
        {
          provide: getModelToken(EmailTemplate),
          useValue: createMockRepository<EmailTemplate>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    repository = module.get<PostgresEmailTemplateRepository>(
      PostgresEmailTemplateRepository,
    );
    emailTemplateModel = module.get<MockRepository>(
      getModelToken(EmailTemplate),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      emailTemplateModel.find.mockClear();
    });

    it('should yield a list of email templates', async () => {
      // Arrange.
      const expectedResult: EmailTemplate[] = [
        {
          name: 'test',
          template: '<h1>Unit Testing</h1>',
          context: null,
        } as EmailTemplate,
      ];
      emailTemplateModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      emailTemplateModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      emailTemplateModel.findOneBy.mockClear();
    });

    it('should yield an email template', async () => {
      // Arrange.
      const expectedResult: EmailTemplate = {
        name: 'test',
        template: '<h1>Unit Testing</h1>',
        context: null,
      } as EmailTemplate;
      emailTemplateModel.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findOne(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'test';
      emailTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(name)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const createEmailTemplateDto: CreateEmailTemplateDto = {
      name: 'test',
      subject: 'title',
      template: '<h1>{{title}}</h1>',
      context: {
        title: 'string',
      },
    };
    const emailTemplate = { ...createEmailTemplateDto } as EmailTemplate;

    afterEach(() => {
      emailTemplateModel.create.mockClear();
      emailTemplateModel.save.mockClear();
    });

    it('should create an email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(emailTemplate);

      // Act.
      await repository.create(createEmailTemplateDto);

      // Assert.
      expect(emailTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield the created email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(emailTemplate);
      emailTemplateModel.save.mockResolvedValue(emailTemplate);

      // Act.
      const func = repository.create.bind(repository, createEmailTemplateDto);

      // Assert.
      await expect(func()).resolves.toEqual(emailTemplate);
    });

    it('should throw an "ExistsException" if an email template already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
      emailTemplateModel.findOneBy.mockResolvedValue({
        name: 'test',
      } as EmailTemplate);

      // Act.
      const func = repository.create.bind(repository, createEmailTemplateDto);

      // Assert.
      await expect(func()).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    const name = 'test';
    const updateEmailTemplateDto: UpdateEmailTemplateDto = {
      template: '<h1>{{title}}</h1>',
      context: {
        title: 'string',
      },
    };
    const emailTemplate = {
      ...updateEmailTemplateDto,
    };

    afterEach(() => {
      emailTemplateModel.preload.mockClear();
      emailTemplateModel.save.mockClear();
    });

    it('should update an email template', async () => {
      // Arrange.
      emailTemplateModel.preload.mockResolvedValue(emailTemplate);

      // Act.
      await repository.update(name, updateEmailTemplateDto);

      // Assert.
      expect(emailTemplateModel.preload).toHaveBeenCalled();
    });

    it('should yield the updated email template', async () => {
      // Arrange.
      emailTemplateModel.preload.mockResolvedValue(emailTemplate);
      emailTemplateModel.save.mockResolvedValue(emailTemplate);

      // Act.
      const func = repository.update.bind(
        repository,
        name,
        updateEmailTemplateDto,
      );

      // Assert.
      await expect(func()).resolves.toEqual(emailTemplate);
    });

    it('should throw a "MissingException" if the repository return null/undefined', async () => {
      // Arrange.
      const name = 'test';
      const expectedResult = new NotFoundException(
        `Email Template ${name} not found!`,
      );
      emailTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.update(name, updateEmailTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const name = 'test';
    const emailTemplate = {};

    afterEach(() => {
      emailTemplateModel.remove.mockClear();
    });

    it('should remove an email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(emailTemplate);
      emailTemplateModel.remove.mockResolvedValue(null);

      // Act.
      await repository.remove(name);

      // Assert.
      expect(emailTemplateModel.remove).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Email Template ${name} not found!`,
      );
      emailTemplateModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});
