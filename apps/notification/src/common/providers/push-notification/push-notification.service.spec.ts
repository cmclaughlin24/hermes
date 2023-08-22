import {
  MissingException,
  Platform,
  PushNotificationDto,
  PushSubscriptionDto,
} from '@hermes/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UnrecoverableError } from 'bullmq';
import * as webpush from 'web-push';
import {
  MockPushTemplateService,
  createConfigServiceMock,
  createPushTemplateServiceMock,
} from '../../../../test/helpers/provider.helper';
import { PushTemplateService } from '../../../resources/push-template/push-template.service';
import { CreatePushNotificationDto } from '../../dto/create-push-notification.dto';
import { PushNotificationService } from './push-notification.service';

jest.mock('web-push');

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let pushTemplateService: MockPushTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: HttpService,
          useValue: { delete: jest.fn() },
        },
        {
          provide: PushTemplateService,
          useValue: createPushTemplateServiceMock(),
        },
      ],
    }).compile();

    service = module.get<PushNotificationService>(PushNotificationService);
    pushTemplateService =
      module.get<MockPushTemplateService>(PushTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPushNotification()', () => {
    it('should send a push notification (web)', async () => {
      // Arrange.
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        notification: {} as PushNotificationDto,
      };

      // Act.
      await service.sendPushNotification(createPushNotificationDto);

      // Assert.
      expect(webpush.sendNotification).toHaveBeenCalled();
    });

    it('should throw an "UnrecoverableError" if a the platform cannot be identified', async () => {
      // Arrange.
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: null,
        subscription: {} as PushSubscriptionDto,
        notification: {} as PushNotificationDto,
      };
      const expectedResult = new UnrecoverableError(
        `Invalid Platform: ${createPushNotificationDto.platform} is not an avaliable platform`,
      );

      // Act/Assert.
      await expect(
        service.sendPushNotification(createPushNotificationDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('createNotificationDto()', () => {
    it('should yield a CreatePushNotificationDto object', async () => {
      // Arrange.
      const payload = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {
          endpoint: 'unit-test',
          keys: {
            auth: 'unit-test',
            p256dh: 'unit-test',
          },
        },
        template: 'unit-test',
      };

      // Act/Assert.
      await expect(
        service.createNotificationDto(payload),
      ).resolves.toBeInstanceOf(CreatePushNotificationDto);
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
      await expect(service.createNotificationDto('unit-test')).rejects.toEqual(
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

    it('should throw an error if data is an invalid CreatePushNotificationDto', async () => {
      // Arrange.
      const payload = {
        subscription: {
          endpoint: 'unit-test',
          keys: {
            auth: 'unit-test',
            p256dh: 'unit-test',
          },
        },
        template: 'unit-test',
      };

      // Act/Assert.
      await expect(
        service.createNotificationDto(payload),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('createPushNotificationTemplate()', () => {
    afterEach(() => {
      pushTemplateService.findOne.mockClear();
    });

    it('should yield a CreatePushNotificationDto with a compiled title template', async () => {
      // Arrange.
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        notification: {
          title: 'Order Confirmation: {{product}}',
        } as PushNotificationDto,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
        },
      };
      const expectedResult: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        notification: {
          title:
            'Order Confirmation: The Legend of Zelda: Tears of the Kingdom',
        } as PushNotificationDto,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
        },
      };

      // Act/Assert.
      await expect(
        service.createPushNotificationTemplate(createPushNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should yield a CreatePushNotificationDto with a compiled title and body template', async () => {
      // Arrange.
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        notification: {
          title: 'Order Confirmation: {{product}}',
          body: 'Your order will be delivered on {{date}}',
        } as PushNotificationDto,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
          date: 'Friday, May 12th',
        },
      };
      const expectedResult: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        notification: {
          title:
            'Order Confirmation: The Legend of Zelda: Tears of the Kingdom',
          body: 'Your order will be delivered on Friday, May 12th',
        } as PushNotificationDto,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
          date: 'Friday, May 12th',
        },
      };

      // Act/Assert.
      await expect(
        service.createPushNotificationTemplate(createPushNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should retrieve a template from the repository if the "template" property is defined', async () => {
      // Arrange.
      const template = 'unit-test';
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        template,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
        },
      };
      pushTemplateService.findOne.mockResolvedValue({
        toJSON: () => ({ title: 'Order Received: {{product}}' }),
        title: 'Order Received: {{product}}',
      });

      // Act.
      await service.createPushNotificationTemplate(createPushNotificationDto);

      // Assert.
      expect(pushTemplateService.findOne).toHaveBeenCalledWith(template);
    });

    it('should throw a "MissingException" if the service returns null/undefined', async () => {
      // Arrange.
      const template = 'unit-test';
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
        template,
        context: {
          product: 'The Legend of Zelda: Tears of the Kingdom',
        },
      };
      const expectedResult = new MissingException(
        `Push Notification Template ${template} does not exist!`,
      );
      pushTemplateService.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.createPushNotificationTemplate(createPushNotificationDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw an error if both "template" and "notification" properties are null/undefined', async () => {
      // Arrange.
      const createPushNotificationDto: CreatePushNotificationDto = {
        subscriberId: 'unit-test',
        platform: Platform.WEB,
        subscription: {} as PushSubscriptionDto,
      };
      const expectedResult = new Error(
        `Invalid Argument: ${CreatePushNotificationDto.name} must have either 'notification' or 'template' keys present`,
      );

      // Act/Assert.
      await expect(
        service.createPushNotificationTemplate(createPushNotificationDto),
      ).rejects.toEqual(expectedResult);
    });
  });
});
