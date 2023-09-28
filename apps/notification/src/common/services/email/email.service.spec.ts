import { MissingException } from '@hermes/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
    MockConfigService,
    MockEmailTemplateService,
    createConfigServiceMock,
    createEmailTemplateServiceMock,
} from '../../../../test/helpers/provider.helper';
import { EmailTemplateService } from '../../../resources/email-template/email-template.service';
import { CreateEmailNotificationDto } from '../../dto/create-email-notification.dto';
import { EmailService } from './email.service';

export type MockMailerService = Partial<Record<keyof MailerService, jest.Mock>>;

export const createMailerServiceMock = (): MockMailerService => ({
  sendMail: jest.fn(),
});

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MockMailerService;
  let configService: MockConfigService;
  let emailTemplateService: MockEmailTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: createMailerServiceMock(),
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: EmailTemplateService,
          useValue: createEmailTemplateServiceMock(),
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MockMailerService>(MailerService);
    configService = module.get<MockConfigService>(ConfigService);
    emailTemplateService =
      module.get<MockEmailTemplateService>(EmailTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail()', () => {
    afterEach(() => {
      mailerService.sendMail.mockClear();
    });

    it('should send an email notification', async () => {
      // Arrange.
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        from: 'example@email.com',
        subject: 'Unit Testing',
        html: '<h1>Unit Testing</h1>',
        text: 'Unit Testing',
        template: null,
        context: null,
      };

      // Act.
      await service.sendEmail(createEmailNotificationDto);

      // Assert.
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        createEmailNotificationDto,
      );
    });

    it("should use the environment's sender if not included in CreateEmailNotification", async () => {
      // Arrange.
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        subject: 'Unit Testing',
        html: '<h1>Unit Testing</h1>',
        text: 'Unit Testing',
        template: null,
        context: null,
      };
      const from = 'no-reply@email.com';
      const expectedResult = {
        ...createEmailNotificationDto,
        from,
      };
      configService.get.mockReturnValue(from);

      // Act.
      await service.sendEmail(createEmailNotificationDto);

      // Assert.
      expect(mailerService.sendMail).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw an error otherwise', async () => {
      // Arrange.
      mailerService.sendMail.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        service.sendEmail({} as CreateEmailNotificationDto),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('createNotificationDto()', () => {
    it('should yield a CreateEmailNotificationDto object', async () => {
      // Arrange.
      const payload = {
        to: 'exmaple@email.com',
        from: 'example@email.com',
        subject: 'Unit Testing',
        text: 'Unit Testing',
        html: '<h1>Unit Testing</h1>',
        template: null,
        context: null,
      };

      // Act/Assert.
      await expect(
        service.createNotificationDto(payload),
      ).resolves.toBeInstanceOf(CreateEmailNotificationDto);
    });

    it('should throw an error if data is null/undefined', async () => {
      // Arrange.
      const expectedResult = new Error('Payload cannot be null/undefined');

      // Act/Assert.
      await expect(service.createNotificationDto(null)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is not an object (primitive)', async () => {
      // Arrange.
      const expectedResult = new Error('Payload must be an object');

      // Act/Assert.
      await expect(service.createNotificationDto('test')).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is not an object (array)', async () => {
      // Arrange.
      const expectedResult = new Error('Payload must be an object');

      // Act/Assert.
      await expect(service.createNotificationDto([])).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is an invalid CreateEmailNotificationDto', async () => {
      // Arrange.
      const payload = {
        from: 'example@email.com',
        subject: 'Unit Testing',
        text: 'Unit Testing',
        html: '<h1>Unit Testing</h1>',
        template: null,
        context: null,
      };

      // Act/Assert.
      await expect(
        service.createNotificationDto(payload),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('createEmailTemplate()', () => {
    afterEach(() => {
      emailTemplateService.findOne.mockClear();
    });

    it('should yield a CreateEmailNotificationDto with a compiled html template', async () => {
      // Arrange.
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        subject: 'Unit Testing',
        html: '<h1>{{title}}</h1>',
        text: 'Unit Testing',
        template: null,
        context: {
          title: 'Unit Testing',
        },
      };
      const expectedResult: CreateEmailNotificationDto = {
        to: createEmailNotificationDto.to,
        subject: createEmailNotificationDto.subject,
        text: createEmailNotificationDto.text,
        html: '<h1>Unit Testing</h1>',
      };

      // Act/Assert.
      await expect(
        service.createEmailTemplate(createEmailNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should retrieve a Handlebars template from the repository if the "template" property is defined', async () => {
      // Arrange.
      const template = 'test';
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        subject: 'Unit Testing',
        text: 'Unit Testing',
        template,
        context: {
          title: 'Unit Testing',
        },
      };
      emailTemplateService.findOne.mockResolvedValue({
        subject: '{{title}}',
        template: '<h1>{{title}}</h1>',
      });

      // Act.
      await service.createEmailTemplate(createEmailNotificationDto);

      // Assert.
      expect(emailTemplateService.findOne).toHaveBeenCalledWith(template);
    });

    it('should throw a "MissingException" if the service returns null/undefined', async () => {
      // Arrange.
      const template = 'test';
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        subject: 'Unit Testing',
        text: 'Unit Testing',
        template,
        context: {
          title: 'Unit Testing',
        },
      };
      const expectedResult = new MissingException(
        `Email template ${template} not found!`,
      );
      emailTemplateService.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.createEmailTemplate(createEmailNotificationDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw an error if both "template" or "html" properties are null/undefined', async () => {
      // Arrange.
      const createEmailNotificationDto: CreateEmailNotificationDto = {
        to: 'example@email.com',
        subject: 'Unit Testing',
        text: 'Unit Testing',
        context: null,
      };
      const expectedResult = new Error(
        `Invalid Argument: ${CreateEmailNotificationDto.name} must have either 'html' or 'template' keys present`,
      );

      // Act/Assert.
      await expect(
        service.createEmailTemplate(createEmailNotificationDto),
      ).rejects.toEqual(expectedResult);
    });
  });
});
