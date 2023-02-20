import { Test, TestingModule } from '@nestjs/testing';
import {
  createEmailServiceMock,
  createNotificationLogServiceMock,
  createPhoneServiceMock,
  createRadioServiceMock
} from '../../../../notification/test/helpers/provider.helpers';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { RadioService } from '../../common/providers/radio/radio.service';
import { NotificationLogService } from '../../resources/notification-log/notification-log.service';
import { NotificationConsumer } from './notification.consumer';

describe('NotificationService', () => {
  let service: NotificationConsumer;

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
          provide: RadioService,
          useValue: createRadioServiceMock(),
        },
        {
          provide: NotificationLogService,
          useValue: createNotificationLogServiceMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationConsumer>(NotificationConsumer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processEmail()', () => {
    it('should yield the created email notification', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should validate the job\'s payload is valid', async () => {
      // Arrange.
      // Act.
      // Assert.
    })

    it('should throw an "Error" if the job\'s payload is invalid', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should generate an email template', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should throw an "Error" if an email template cannot be generated', async () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('processText()', () => {
    it('should yield the created text notification', async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it('should validate the job\'s payload is valid', async () => {
      // Arrange.
      // Act.
      // Assert.
    })

    it('should throw an "Error" if the job\'s payload is invalid', async () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('processRadio()', () => {});

  describe('onQueueError()', () => {
    it('should log the error to the console', () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('onQueueCompleted()', () => {
    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });

  describe('onQueueFailed()', () => {
    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      // Act.
      // Assert.
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      // Act.
      // Assert.
    });
  });
});
