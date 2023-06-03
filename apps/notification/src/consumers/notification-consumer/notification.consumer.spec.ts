import { DeliveryMethods } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, UnrecoverableError } from 'bullmq';
import {
  MockEmailService,
  MockNotificationLogService,
  MockPhoneService,
  MockPushNotificationService,
  createEmailServiceMock,
  createNotificationLogServiceMock,
  createPhoneServiceMock,
  createPushNotificationServiceMock,
} from '../../../../notification/test/helpers/provider.helpers';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { PushNotificationService } from '../../common/providers/push-notification/push-notification.service';
import { NotificationLogService } from '../../resources/notification-log/notification-log.service';
import { NotificationConsumer } from './notification.consumer';

describe('NotificationService', () => {
  let service: NotificationConsumer;
  let emailService: MockEmailService;
  let phoneService: MockPhoneService;
  let notificationLogService: MockNotificationLogService;
  let pushNotificationService: MockPushNotificationService;

  const job: any = { id: 1, data: {}, log: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: EmailService,
          useValue: createEmailServiceMock(),
        },
        {
          provide: PhoneService,
          useValue: createPhoneServiceMock(),
        },
        {
          provide: NotificationLogService,
          useValue: createNotificationLogServiceMock(),
        },
        {
          provide: PushNotificationService,
          useValue: createPushNotificationServiceMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationConsumer>(NotificationConsumer);
    emailService = module.get<MockEmailService>(EmailService);
    phoneService = module.get<MockPhoneService>(PhoneService);
    notificationLogService = module.get<MockNotificationLogService>(
      NotificationLogService,
    );
    pushNotificationService = module.get<MockPushNotificationService>(
      PushNotificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('process()', () => {
    it('should yield the result of a processed job (email)', async () => {
      // Arrange.
      const expectedResult: any = {};
      const processEmail = jest
        .spyOn(service, 'processEmail')
        .mockResolvedValue(expectedResult);

      // Act.
      await service.process({ name: DeliveryMethods.EMAIL } as Job);

      // Assert.
      expect(processEmail).toHaveBeenCalled();
    });

    it('should yield the result of a processed job (SMS)', async () => {
      // Arrange.
      const expectedResult: any = {};
      const processText = jest
        .spyOn(service, 'processText')
        .mockResolvedValue(expectedResult);

      // Act.
      await service.process({ name: DeliveryMethods.SMS } as Job);

      // Assert.
      expect(processText).toHaveBeenCalled();
    });

    it('should yield the result of a processed job (call)', async () => {
      // Arrange.
      const expectedResult: any = {};
      const processCall = jest
        .spyOn(service, 'processCall')
        .mockResolvedValue(expectedResult);

      // Act.
      await service.process({ name: DeliveryMethods.CALL } as Job);

      // Assert.
      expect(processCall).toHaveBeenCalled();
    });

    it('should throw an "UnrecoverableError" if a process method cannot be identified for a job', async () => {
      // Arrange.
      const name = 'unit-test';
      const expectedResult = new UnrecoverableError(
        `Invalid Delivery Method: ${name} is not an available delievery method`,
      );

      // Act/Assert.
      await expect(service.process({ name } as Job)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('processEmail()', () => {
    const createEmailNotificationDto: CreateEmailNotificationDto = {
      to: 'john.doe@email.com',
      from: 'no-reply@email.com',
      subject: 'Unit Testing',
      html: '<h1>Unit Testing</h1>',
      text: 'Unit Testing',
      template: null,
      context: null,
    };

    afterEach(() => {
      emailService.createNotificationDto.mockClear();
      emailService.createEmailTemplate.mockClear();
      emailService.sendEmail.mockClear();
    });

    it('should yield the created email notification', async () => {
      // Arrange.
      const expectedResult = {};
      emailService.createNotificationDto.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.createEmailTemplate.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.sendEmail.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.processEmail(job)).resolves.toEqual(expectedResult);
    });

    it("should validate the job's payload is valid", async () => {
      // Arrange.
      emailService.createNotificationDto.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.createEmailTemplate.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.sendEmail.mockResolvedValue(null);

      // Act.
      await service.processEmail(job);

      // Assert.
      expect(emailService.createNotificationDto).toHaveBeenCalledWith(job.data);
    });

    it('should throw an "Error" if the job\'s payload is invalid', async () => {
      // Arrange.
      const error = new Error('unit testing');
      const expectedResult = new Error(
        `[${NotificationConsumer.name} processEmail] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
      );
      emailService.createNotificationDto.mockRejectedValue(error);

      // Act/Assert.
      await expect(service.processEmail(job)).rejects.toEqual(expectedResult);
    });

    it('should generate an email template', async () => {
      // Arrange.
      emailService.createNotificationDto.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.createEmailTemplate.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.sendEmail.mockResolvedValue(null);

      // Act.
      await service.processEmail(job);

      // Assert.
      expect(emailService.createEmailTemplate).toHaveBeenCalledWith(
        createEmailNotificationDto,
      );
    });

    it('should throw an "Error" if an email template cannot be generated', async () => {
      // Arrange.
      const expectedResult = new Error(
        `Invalid Argument: ${CreateEmailNotificationDto.name} must have either 'html' or 'template' keys present`,
      );
      emailService.createNotificationDto.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.createEmailTemplate.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.processEmail(job)).rejects.toEqual(expectedResult);
    });

    it('should throw an "Error" if an email failed to send', async () => {
      // Arrange.
      const expectedResult = new Error('Something went wrong');
      emailService.createNotificationDto.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.createEmailTemplate.mockResolvedValue(
        createEmailNotificationDto,
      );
      emailService.sendEmail.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.processEmail(job)).rejects.toEqual(expectedResult);
    });
  });

  describe('processText()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    afterEach(() => {
      phoneService.createNotificationDto.mockClear();
      phoneService.sendText.mockClear();
    });

    it('should yield the created text notification', async () => {
      // Arrange.
      const expectedResult = {};
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendText.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.processText(job)).resolves.toEqual(expectedResult);
    });

    it("should validate the job's payload is valid", async () => {
      // Arrange.
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendText.mockResolvedValue(null);

      // Act.
      await service.processText(job);

      // Assert.
      expect(phoneService.createNotificationDto).toHaveBeenCalledWith(job.data);
    });

    it('should throw an "Error" if the job\'s payload is invalid', async () => {
      // Arrange.
      const error = new Error('unit testing');
      const expectedResult = new Error(
        `[${NotificationConsumer.name} processText] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
      );
      phoneService.createNotificationDto.mockRejectedValue(error);
      phoneService.sendText.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.processText(job)).rejects.toEqual(expectedResult);
    });

    it('should throw an "Error" if an text failed to send', async () => {
      // Arrange.
      const expectedResult = new Error('Something went wrong');
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendText.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.processText(job)).rejects.toEqual(expectedResult);
    });
  });

  describe('processCall()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    afterEach(() => {
      phoneService.createNotificationDto.mockClear();
      phoneService.sendCall.mockClear();
    });

    it('should yield the created text notification', async () => {
      // Arrange.
      const expectedResult = {};
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendCall.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.processCall(job)).resolves.toEqual(expectedResult);
    });

    it("should validate the job's payload is valid", async () => {
      // Arrange.
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendCall.mockResolvedValue(null);

      // Act.
      await service.processCall(job);

      // Assert.
      expect(phoneService.createNotificationDto).toHaveBeenCalledWith(job.data);
    });

    it('should throw an "Error" if the job\'s payload is invalid', async () => {
      // Arrange.
      const error = new Error('unit testing');
      const expectedResult = new Error(
        `[${NotificationConsumer.name} processCall] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
      );
      phoneService.createNotificationDto.mockRejectedValue(error);
      phoneService.sendCall.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.processCall(job)).rejects.toEqual(expectedResult);
    });

    it('should throw an "Error" if an text failed to send', async () => {
      // Arrange.
      const expectedResult = new Error('Something went wrong');
      phoneService.createNotificationDto.mockResolvedValue(
        createPhoneNotificationDto,
      );
      phoneService.sendCall.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.processCall(job)).rejects.toEqual(expectedResult);
    });
  });

  describe('onQueueError()', () => {
    it.todo('should log the error to the console');
  });

  describe('onQueueCompleted()', () => {
    afterEach(() => {
      notificationLogService.log.mockClear();
      job.update.mockClear();
      job.log.mockClear();
    });

    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      const result = {};

      // Act.
      await service.onQueueCompleted(job, result);

      // Assert.
      expect(notificationLogService.log).toHaveBeenCalledWith(
        job,
        'completed',
        result,
        null,
      );
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = {
        ...job.data,
        notification_database_id: id,
      };
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await service.onQueueCompleted(job, null);

      // Assert.
      expect(job.update).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await service.onQueueCompleted(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await service.onQueueCompleted(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('onQueueFailed()', () => {
    afterEach(() => {
      notificationLogService.log.mockClear();
      job.update.mockClear();
      job.log.mockClear();
    });

    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      const error = new Error();

      // Act.
      await service.onQueueFailed(job, error);

      // Assert.
      expect(notificationLogService.log).toHaveBeenCalledWith(
        job,
        'failed',
        null,
        error,
      );
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = {
        ...job.data,
        notification_database_id: id,
      };
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await service.onQueueFailed(job, null);

      // Assert.
      expect(job.update).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await service.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await service.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });
  });
});
