import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { ExistsException, MissingException } from '@hermes/common';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrmEmailTemplateRepository } from './orm-email-template.repository';
import {
  createMockRepository,
  MockRepository,
} from '../../../test/helpers/database.helper';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';
import { EmailTemplate } from '../domain/email-template';
import { EmailTemplateProfile } from '../profiles/email-template.profile';

describe('OrmEmailTemplateRepository', () => {
  let repository: OrmEmailTemplateRepository;
  let emailTemplateModel: MockRepository;

  const entity = new EmailTemplateEntity();
  entity.name = 'test';
  entity.subject = '';
  entity.template = '<h1>Unit Testing</h1>';
  entity.context = null;
  entity.createdAt = new Date();
  entity.updatedAt = new Date();

  const template = new EmailTemplate();
  template.name = entity.name;
  template.subject = entity.subject;
  template.template = entity.template;
  template.context = entity.context;
  template.createdAt = entity.createdAt;
  template.updatedAt = entity.updatedAt;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
      providers: [
        OrmEmailTemplateRepository,
        EmailTemplateProfile,
        {
          provide: getRepositoryToken(EmailTemplateEntity),
          useValue: createMockRepository<EmailTemplateEntity>(),
        },
      ],
    }).compile();

    repository = module.get<OrmEmailTemplateRepository>(
      OrmEmailTemplateRepository,
    );
    emailTemplateModel = module.get<MockRepository>(
      getRepositoryToken(EmailTemplateEntity),
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
      const expectedResult: EmailTemplate[] = [template];
      emailTemplateModel.find.mockResolvedValue([entity]);

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
      emailTemplateModel.findOneBy.mockResolvedValue(entity);

      // Act/Assert.
      await expect(repository.findOne(entity.name)).resolves.toEqual(template);
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

    afterEach(() => {
      emailTemplateModel.create.mockClear();
      emailTemplateModel.save.mockClear();
    });

    it('should create an email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(entity);
      emailTemplateModel.save.mockResolvedValue(template);

      // Act.
      await repository.create(createEmailTemplateDto);

      // Assert.
      expect(emailTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield the created email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(entity);
      emailTemplateModel.save.mockResolvedValue(template);

      // Act.
      const func = repository.create.bind(repository, createEmailTemplateDto);

      // Assert.
      await expect(func()).resolves.toEqual(template);
    });

    it('should throw an "ExistsException" if an email template already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
      emailTemplateModel.findOneBy.mockResolvedValue(entity);

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

    afterEach(() => {
      emailTemplateModel.preload.mockClear();
      emailTemplateModel.save.mockClear();
    });

    it('should update an email template', async () => {
      // Arrange.
      emailTemplateModel.preload.mockResolvedValue(entity);
      emailTemplateModel.save.mockResolvedValue(entity);

      // Act.
      await repository.update(name, updateEmailTemplateDto);

      // Assert.
      expect(emailTemplateModel.preload).toHaveBeenCalled();
    });

    it('should yield the updated email template', async () => {
      // Arrange.
      emailTemplateModel.preload.mockResolvedValue(entity);
      emailTemplateModel.save.mockResolvedValue(entity);

      // Act.
      const func = repository.update.bind(
        repository,
        name,
        updateEmailTemplateDto,
      );

      // Assert.
      await expect(func()).resolves.toEqual(template);
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

    afterEach(() => {
      emailTemplateModel.remove.mockClear();
    });

    it('should remove an email template', async () => {
      // Arrange.
      emailTemplateModel.findOneBy.mockResolvedValue(entity);
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
