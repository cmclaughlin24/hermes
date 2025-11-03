import { DeliveryMethods, MissingException } from '@hermes/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import {
  MockConfigService,
  MockPhoneTemplateService,
  createConfigServiceMock,
  createPhoneTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { PhoneNotifierStrategy as BasePhoneStrategy } from './phone-notifier.strategy';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';
import { Injectable } from '@nestjs/common';

const createTwilioServiceMock = () => ({
  client: {
    messages: {
      create: jest.fn(),
    },
    calls: {
      create: jest.fn(),
    },
  },
});

@Injectable()
class PhoneNotifierStrategy extends BasePhoneStrategy {
  type: DeliveryMethods.CALL | DeliveryMethods.SMS = DeliveryMethods.CALL;

  constructor(
    twilioService: TwilioService,
    configService: ConfigService,
    phoneTemplateService: PhoneTemplateService,
  ) {
    super(twilioService, configService, phoneTemplateService);
  }

  async notify(_dto: CreatePhoneNotificationDto): Promise<any> {}
}

describe('PhoneNotifierStrategy', () => {
  let strategy: PhoneNotifierStrategy;
  let twilioService: any;
  let configService: MockConfigService;
  let phoneTemplateService: MockPhoneTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneNotifierStrategy,
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: TwilioService,
          useValue: createTwilioServiceMock(),
        },
        {
          provide: PhoneTemplateService,
          useValue: createPhoneTemplateServiceMock(),
        },
      ],
    }).compile();

    strategy = module.get<PhoneNotifierStrategy>(PhoneNotifierStrategy);
    twilioService = module.get<any>(TwilioService);
    configService = module.get<MockConfigService>(ConfigService);
    phoneTemplateService =
      module.get<MockPhoneTemplateService>(PhoneTemplateService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('createNotificationDto()', () => {
    it('should yield a CreatePhoneNotificationDto object', async () => {
      // Arrange.
      const payload = {
        to: '+12818071479',
        from: '+12818071479',
        body: 'Unit Testing',
      };

      // Act/Assert.
      await expect(
        strategy.createNotificationDto(payload),
      ).resolves.toBeInstanceOf(CreatePhoneNotificationDto);
    });

    it('should throw an error if data is null/undefined', async () => {
      // Arrange.
      const expectedResult = new Error('Payload cannot be null/undefined');

      // Act/Assert.
      await expect(strategy.createNotificationDto(null)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is not an object (primitive)', async () => {
      // Arrange.
      const expectedResult = new Error('Payload must be an object');

      // Act/Assert.
      await expect(strategy.createNotificationDto('test')).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is not an object (array)', async () => {
      // Arrange.
      const expectedResult = new Error('Payload must be an object');

      // Act/Assert.
      await expect(strategy.createNotificationDto([])).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if data is an invalid CreatePhoneNotificationDto', async () => {
      // Arrange.
      const payload = {
        from: '+12818071479',
      };

      // Act/Assert.
      await expect(
        strategy.createNotificationDto(payload),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('createPhoneTemplate()', () => {
    afterEach(() => {
      phoneTemplateService.findOne.mockClear();
    });

    it('should yield a CreatePhoneNotificationDto with a compiled body template', async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+18883117422',
        body: '{{title}}',
        timeZone: 'America/Chicago',
        template: null,
        context: {
          title: 'Unit Testing',
        },
      };
      const expectedResult: CreatePhoneNotificationDto = {
        to: createPhoneNotificationDto.to,
        from: createPhoneNotificationDto.from,
        body: 'Unit Testing',
        template: null,
        timeZone: createPhoneNotificationDto.timeZone,
        context: createPhoneNotificationDto.context,
      };

      // Act/Assert.
      await expect(
        strategy.createTemplate(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should retrieve a template from the repository if the "template" property is defined', async () => {
      // Arrange.
      const template = 'test';
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+18883117422',
        body: '{{title}}',
        timeZone: 'America/Chicago',
        template,
        context: {
          title: 'Unit Testing',
        },
      };
      phoneTemplateService.findOne.mockResolvedValue({
        template: '{{title}}',
      });

      // Act.
      await strategy.createTemplate(createPhoneNotificationDto);

      // Assert.
      expect(phoneTemplateService.findOne).toHaveBeenCalledWith(
        DeliveryMethods.CALL,
        template,
      );
    });

    it('should throw a "MissingException" if the service returns null/undefined', async () => {
      // Arrange.
      const template = 'test';
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+18883117422',
        body: '{{title}}',
        timeZone: 'America/Chicago',
        template,
        context: {
          title: 'Unit Testing',
        },
      };
      const expectedResult = new MissingException(
        `Phone template name=${template} for deliveryMethod=${DeliveryMethods.CALL} not found!`,
      );
      phoneTemplateService.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        strategy.createTemplate(createPhoneNotificationDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw an error if both "template" or "body" properties are null/undefined', async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+18883117422',
        timeZone: 'America/Chicago',
        context: {
          title: 'Unit Testing',
        },
      };
      const expectedResult = new Error(
        `Invalid Argument: ${CreatePhoneNotificationDto.name} must have either 'body' or 'template' keys present`,
      );

      // Act/Assert.
      await expect(
        strategy.createTemplate(createPhoneNotificationDto),
      ).rejects.toEqual(expectedResult);
    });
  });
});
