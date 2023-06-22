import { ApiResponseDto } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  createMockRepository,
} from '../../../../notification/test/helpers/database.helpers';
import { createCacheStoreMock } from '../../../test/helpers/provider.helpers';
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
          useValue: createCacheStoreMock()
        }
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

    it('should throw a "NotFoundException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email templates not found!`,
      );
      emailTemplateModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email templates not found!`,
      );
      emailTemplateModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).rejects.toEqual(expectedResult);
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

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const name = 'test';
      const expectedResult = new NotFoundException(
        `Email Template with ${name} not found!`,
      );
      emailTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(name)).rejects.toEqual(expectedResult);
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

    it('should yield an "ApiResponseDto" object with the created email template', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully created email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      emailTemplateModel.findByPk.mockResolvedValue(null);
      emailTemplateModel.create.mockResolvedValue(emailTemplate);

      // Act.
      const func = service.create.bind(service, createEmailTemplateDto);

      // Assert.
      await expect(func()).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if an email template already exists', async () => {
      // Arrange.
      const expectedResult = new BadRequestException(
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

    it('should yield an "ApiResponseDto" object with the updated email template', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully updated email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      emailTemplateModel.findByPk.mockResolvedValue(emailTemplate);
      emailTemplate.update.mockResolvedValue(emailTemplate);

      // Act.
      const func = service.update.bind(
        service,
        updateEmailTemplateDto.name,
        updateEmailTemplateDto,
      );

      // Assert.
      await expect(func()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const name = 'test';
      const expectedResult = new NotFoundException(
        `Email Template with ${name} not found!`,
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

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted email template ${name}!`,
      );
      emailTemplateModel.findByPk.mockResolvedValue(emailTemplate);
      emailTemplate.destroy.mockResolvedValue(null);

      // Act.
      const func = service.remove.bind(service, name);

      // Assert.
      await expect(func()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email Template with ${name} not found!`,
      );
      emailTemplateModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(name)).rejects.toEqual(expectedResult);
    });
  });
});
