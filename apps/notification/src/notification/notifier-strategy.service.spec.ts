import { DeliveryMethods } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotifierStrategyService } from './notifier-strategy.service';
import { EmailNotifierStrategy } from './strategies/email-notifier.strategy';
import {
  createCallNotifierStrategyMock,
  createEmailNotifierStrategyMock,
  createPushNotifierStrategyMock,
  createSmsNotifierStrategyMock,
  MockCallStrategy,
  MockEmailNotifierStrategy,
  MockPushNotifierStrategy,
  MockSmsNotifierStrategy,
} from '../../test/helpers/provider.helper';
import { CallNotifierStrategy } from './strategies/call-notifier.strategy';
import { SmsNotifierStrategy } from './strategies/sms-notifier.strategy';
import { PushNotifierStrategy } from './strategies/push-notifier.strategy';

describe('NotifierStrategyService', () => {
  let service: NotifierStrategyService;
  let emailStrategy: MockEmailNotifierStrategy;
  let callStrategy: MockCallStrategy;
  let smsStrategy: MockSmsNotifierStrategy;
  let pushStrategy: MockPushNotifierStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifierStrategyService,
        {
          provide: EmailNotifierStrategy,
          useValue: createEmailNotifierStrategyMock(),
        },
        {
          provide: CallNotifierStrategy,
          useValue: createCallNotifierStrategyMock(),
        },
        {
          provide: SmsNotifierStrategy,
          useValue: createSmsNotifierStrategyMock(),
        },

        {
          provide: PushNotifierStrategy,
          useValue: createPushNotifierStrategyMock(),
        },
      ],
    }).compile();

    service = module.get<NotifierStrategyService>(NotifierStrategyService);
    emailStrategy = module.get<MockEmailNotifierStrategy>(
      EmailNotifierStrategy,
    );
    callStrategy = module.get<MockCallStrategy>(CallNotifierStrategy);
    smsStrategy = module.get<MockSmsNotifierStrategy>(SmsNotifierStrategy);
    pushStrategy = module.get<MockPushNotifierStrategy>(PushNotifierStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get()', () => {
    it(`should yield the EmailNotifierStrategy if the delivery method is ${DeliveryMethods.EMAIL}`, () => {
      // Act/Assert.
      expect(service.get(DeliveryMethods.EMAIL)).toEqual(emailStrategy);
    });

    it(`should yield the CallNotifierStrategy if the delivery method is ${DeliveryMethods.CALL}`, () => {
      // Act/Assert.
      expect(service.get(DeliveryMethods.CALL)).toEqual(callStrategy);
    });

    it(`should yield the SmsNotifierStrategy if the delivery method is ${DeliveryMethods.SMS}`, () => {
      // Act/Assert.
      expect(service.get(DeliveryMethods.SMS)).toEqual(smsStrategy);
    });

    it(`should yield the PushNotifierStrategy if the delivery method is ${DeliveryMethods.PUSH}`, () => {
      // Act/Assert.
      expect(service.get(DeliveryMethods.PUSH)).toEqual(pushStrategy);
    });
  });
});
