import { ExistsException, MissingException } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { createCacheStoreMock } from '../../../test/helpers/provider.helper';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;
  let emailTemplateModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
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

    service = module.get<EmailTemplateService>(EmailTemplateService);
    emailTemplateModel = module.get<MockRepository>(
      getModelToken(EmailTemplate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      emailTemplateModel.findAll.mockClear();
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
      emailTemplateModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      emailTemplateModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      emailTemplateModel.findByPk.mockClear();
    });

    it('should yield an email template', async () => {
      // Arrange.
      const expectedResult: EmailTemplate = {
        name: 'test',
        template: '<h1>Unit Testing</h1>',
        context: null,
      } as EmailTemplate;
      emailTemplateModel.findByPk.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'test';
      emailTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(name)).resolves.toBeNull();
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
    });

    it('should create an email template', async () => {
      // Arrange.
      emailTemplateModel.findByPk.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(emailTemplate);

      // Act.
      await service.create(createEmailTemplateDto);

      // Assert.
      expect(emailTemplateModel.create).toHaveBeenCalled();
    });

    it('should yield the created email template', async () => {
      // Arrange.
      emailTemplateModel.findByPk.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(emailTemplate);

      // Act.
      const func = service.create.bind(service, createEmailTemplateDto);

      // Assert.
      await expect(func()).resolves.toEqual(emailTemplate);
    });

    it('should throw an "ExistsException" if an email template already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
      emailTemplateModel.findByPk.mockResolvedValue({
        name: 'test',
      } as EmailTemplate);

      // Act.
      const func = service.create.bind(service, createEmailTemplateDto);

      // Assert.
      await expect(func()).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    const updateEmailTemplateDto: UpdateEmailTemplateDto = {
      name: 'test',
      template: '<h1>{{title}}</h1>',
      context: {
        title: 'string',
      },
    };
    const emailTemplate = {
      ...updateEmailTemplateDto,
      update: jest.fn(),
    };

    afterEach(() => {
      emailTemplateModel.update.mockClear();
    });

    it('should update an email template', async () => {
      // Arrange.
      emailTemplateModel.findByPk.mockResolvedValue(emailTemplate);
      emailTemplate.update.mockResolvedValue(emailTemplate);

      // Act.
      await service.update(updateEmailTemplateDto.name, updateEmailTemplateDto);

      // Assert.
      expect(emailTemplate.update).toHaveBeenCalled();
    });

    it('should yield the updated email template', async () => {
      // Arrange.
      emailTemplateModel.findByPk.mockResolvedValue(emailTemplate);
      emailTemplate.update.mockResolvedValue(emailTemplate);

      // Act.
      const func = service.update.bind(
        service,
        updateEmailTemplateDto.name,
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
      emailTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(name, updateEmailTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const name = 'test';
    const emailTemplate = { destroy: jest.fn() };

    afterEach(() => {
      emailTemplateModel.destroy.mockClear();
    });

    it('should remove an email template', async () => {
      // Arrange.
      emailTemplateModel.findByPk.mockResolvedValue(emailTemplate);
      emailTemplate.destroy.mockResolvedValue(null);

      // Act.
      await service.remove(name);

      // Assert.
      expect(emailTemplate.destroy).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Email Template ${name} not found!`,
      );
      emailTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});
