import {
  ApiResponseDto,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockEmailTemplateService,
  createEmailTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { EmailTemplate } from './repository/entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateController', () => {
  let controller: EmailTemplateController;
  let service: MockEmailTemplateService;

  const emailTemplate: EmailTemplate = {
    name: 'test',
    template: '<h1>Unit Testing</h1>',
    context: null,
  } as EmailTemplate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplateController],
      providers: [
        {
          provide: EmailTemplateService,
          useValue: createEmailTemplateServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<EmailTemplateController>(EmailTemplateController);
    service = module.get<MockEmailTemplateService>(EmailTemplateService);
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
      const expectedResult: EmailTemplate[] = [emailTemplate];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email templates not found!`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email templates not found!`,
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
      service.findOne.mockResolvedValue(emailTemplate);

      // Act/Assert.
      await expect(controller.findOne(emailTemplate.name)).resolves.toEqual(
        emailTemplate,
      );
    });

    it('should throw a "NotFoundException" if the service return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Email Template ${emailTemplate.name} not found!`,
      );
      service.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findOne(emailTemplate.name)).rejects.toEqual(
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
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully created email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      service.create.mockResolvedValue(emailTemplate);

      // Act/Assert.
      await expect(
        controller.create({} as CreateEmailTemplateDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "BadRequestExcepction" if an email template already exists', async () => {
      // Arrange.
      const errorMessage = `Email Template ${emailTemplate.name} already exists!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({} as CreateEmailTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully updated email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      service.update.mockResolvedValue(emailTemplate);

      // Act/Assert.
      await expect(
        controller.update(emailTemplate.name, {} as UpdateEmailTemplateDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if an email template does not exist', async () => {
      // Arrange.
      const errorMessage = `Email Template ${emailTemplate.name} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(emailTemplate.name, {} as UpdateEmailTemplateDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully deleted email template ${emailTemplate.name}!`,
      );
      service.remove.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.remove(emailTemplate.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "NotFoundException" if an email template does not exist', async () => {
      // Arrange.
      const errorMessage = `Email Template ${emailTemplate.name} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(controller.remove(emailTemplate.name)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
