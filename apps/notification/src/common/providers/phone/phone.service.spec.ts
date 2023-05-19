import { DeliveryMethods } from '@hermes/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import {
  MockConfigService,
  MockPhoneTemplateService,
  createConfigServiceMock,
  createPhoneTemplateServiceMock,
} from '../../../../../notification/test/helpers/provider.helpers';
import { PhoneTemplateService } from '../../../resources/phone-template/phone-template.service';
import { CreatePhoneNotificationDto } from '../../dto/create-phone-notification.dto';
import { PhoneService } from './phone.service';

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

describe('PhoneService', () => {
  let service: PhoneService;
  let twilioService: any;
  let configService: MockConfigService;
  let phoneTemplateService: MockPhoneTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneService,
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

    service = module.get<PhoneService>(PhoneService);
    twilioService = module.get<any>(TwilioService);
    configService = module.get<MockConfigService>(ConfigService);
    phoneTemplateService =
      module.get<MockPhoneTemplateService>(PhoneTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendText()', () => {
    afterEach(() => {
      twilioService.client.messages.create.mockClear();
    });

    it('should send a text notification', async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+12818071479',
        from: '+12818071479',
        body: 'Unit Testing',
      };

      // Act.
      await service.sendText(createPhoneNotificationDto);

      // Assert.
      expect(twilioService.client.messages.create).toHaveBeenCalledWith(
        createPhoneNotificationDto,
      );
    });

    it("should use the environment's phone number if not included in CreatePhoneNotificationDto", async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+12818071479',
        body: 'Unit Testing',
      };
      const from = '+12918071478';
      const expectedResult = {
        ...createPhoneNotificationDto,
        from,
      };
      configService.get.mockReturnValue(from);

      // Act.
      await service.sendText(createPhoneNotificationDto);

      // Assert.
      expect(twilioService.client.messages.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should throw an error otherwise', async () => {
      // Arrange.
      twilioService.client.messages.create.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        service.sendText({} as CreatePhoneNotificationDto),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('sendCall()', () => {
    afterEach(() => {
      twilioService.client.calls.create.mockClear();
    });

    it('should send a call notification', async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+12818071479',
        from: '+12818071479',
        body: 'Unit Testing',
      };
      const expectedResult = {
        to: createPhoneNotificationDto.to,
        from: createPhoneNotificationDto.from,
        twiml: createPhoneNotificationDto.body,
      };

      // Act.
      await service.sendCall(createPhoneNotificationDto);

      // Assert.
      expect(twilioService.client.calls.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it("should use the environment's phone number if not included in CreatePhoneNotificationDto", async () => {
      // Arrange.
      const createPhoneNotificationDto: CreatePhoneNotificationDto = {
        to: '+12818071479',
        body: 'Unit Testing',
      };
      const from = '+12918071478';
      const expectedResult = {
        to: createPhoneNotificationDto.to,
        twiml: createPhoneNotificationDto.body,
        from,
      };
      configService.get.mockReturnValue(from);

      // Act.
      await service.sendCall(createPhoneNotificationDto);

      // Assert.
      expect(twilioService.client.calls.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });
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
        service.createNotificationDto(payload),
      ).resolves.toBeInstanceOf(CreatePhoneNotificationDto);
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

    it('should throw an error if data is an invalid CreatePhoneNotificationDto', async () => {
      // Arrange.
      const payload = {
        from: '+12818071479',
      };

      // Act/Assert.
      await expect(
        service.createNotificationDto(payload),
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
        service.createPhoneTemplate(
          DeliveryMethods.SMS,
          createPhoneNotificationDto,
        ),
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
      await service.createPhoneTemplate(
        DeliveryMethods.CALL,
        createPhoneNotificationDto,
      );

      // Assert.
      expect(phoneTemplateService.findOne).toHaveBeenCalledWith(
        DeliveryMethods.CALL,
        template,
      );
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
        service.createPhoneTemplate(
          DeliveryMethods.SMS,
          createPhoneNotificationDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });
});
