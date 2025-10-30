import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import {
  MockConfigService,
  createConfigServiceMock,
  createPhoneTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { SmsStrategy } from './sms.strategy';

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

describe('SmsStrategy', () => {
  let strategy: SmsStrategy;
  let twilioService: any;
  let configService: MockConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsStrategy,
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

    strategy = module.get<SmsStrategy>(SmsStrategy);
    twilioService = module.get<any>(TwilioService);
    configService = module.get<MockConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('notify()', () => {
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
      await strategy.notify(createPhoneNotificationDto);

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
      await strategy.notify(createPhoneNotificationDto);

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
        strategy.notify({} as CreatePhoneNotificationDto),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
