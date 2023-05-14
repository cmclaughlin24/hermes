import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import {
  MockConfigService,
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
  },
});

describe('PhoneService', () => {
  let service: PhoneService;
  let twilioService: any;
  let configService: MockConfigService;

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
    it.todo('should send a call notification');

    it.todo(
      "should use the environment's phone number if not included in CreatePhoneNotificationDto",
    );
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
    it.todo(
      'should yield a CreatePhoneNotificationDto with a compiled body template',
    );

    it.todo(
      'should retrieve a template from the repository if the "template" property is defined',
    );

    it.todo(
      'should throw an error if both "template" or "body" properties are null/undefined',
    );
  });
});
