import { ApiResponseDto } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockEmailTemplateService,
  createEmailTemplateServiceMock,
} from '../../../../notification/test/helpers/provider.helpers';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

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
    it('should yield a list of email templates', async () => {
      // Arrange.
      const expectedResult: EmailTemplate[] = [emailTemplate];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield an email template', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(emailTemplate);

      // Act/Assert.
      await expect(controller.findOne(emailTemplate.name)).resolves.toEqual(
        emailTemplate,
      );
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully created email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreateEmailTemplateDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully updated email template ${emailTemplate.name}!`,
        emailTemplate,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update(emailTemplate.name, {} as UpdateEmailTemplateDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<EmailTemplate>(
        `Successfully deleted email template ${emailTemplate.name}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.remove(emailTemplate.name)).resolves.toEqual(
        expectedResult,
      );
    });
  });
});
