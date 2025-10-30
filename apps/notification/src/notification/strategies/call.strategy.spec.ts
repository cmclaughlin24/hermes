import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from 'nestjs-twilio';
import {
  MockConfigService,
  createConfigServiceMock,
  createPhoneTemplateServiceMock,
} from '../../../test/helpers/provider.helper';
import { CallStrategy } from './call.strategy';
import { PhoneTemplateService } from '../../phone-template/phone-template.service';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';

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

describe('CallStrategy', () => {
  let strategy: CallStrategy;
  let twilioService: any;
  let configService: MockConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallStrategy,
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

    strategy = module.get<CallStrategy>(CallStrategy);
    twilioService = module.get<any>(TwilioService);
    configService = module.get<MockConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('notify()', () => {
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
      await strategy.notify(createPhoneNotificationDto);

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
      await strategy.notify(createPhoneNotificationDto);

      // Assert.
      expect(twilioService.client.calls.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });
  });
});
