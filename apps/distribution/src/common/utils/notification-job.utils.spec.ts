import { DeliveryMethods, Platform, PushSubscriptionDto } from '@hermes/common';
import { DateTime } from 'luxon';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';
import { Recipient } from '../classes/recipient.class';
import { DeviceSubscriberDto } from '../dto/device-subscriber.dto';
import { DistributionMessageDto } from '../dto/distribution-message.dto';
import { SubscriberDto } from '../dto/subscriber.dto';
import { UserSubscriberDto } from '../dto/user-subscriber.dto';
import {
  createNotificationJobs,
  hasDeliveryMethods,
  hasDeliveryWindow,
  isBetweenTimes,
  mapToNotificationJobs,
  zeroToOneDayIndex,
} from './notification-job.utils';

describe('notification-job.utils.ts', () => {
  describe('createNotificationJobs()', () => {
    it('should yield a list of notification jobs', () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: false,
        deliveryMethods: [
          DeliveryMethods.EMAIL,
          DeliveryMethods.PUSH,
          DeliveryMethods.SMS,
        ],
        text: 'the-manual-for-the-original-mario-kart-encouraged-screen-peeking',
        emailTemplate: 'super-mario-kart',
        smsTemplate: 'super-mario-kart',
        pushTemplate: 'super-mario-kart',
      } as DistributionRule;
      const subscription1 = new UserSubscriberDto();
      subscription1.deliveryMethods = [
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
      ];
      subscription1.email = 'nolan.bushnell@atari.com';
      subscription1.phoneNumber = '+12345678910';
      const subscription2 = new UserSubscriberDto();
      subscription2.deliveryMethods = [DeliveryMethods.EMAIL];
      subscription2.email = 'johnathan.blackley@xbox.com';
      subscription2.phoneNumber = null;
      const subscription3 = new DeviceSubscriberDto();
      subscription3.platform = Platform.IOS;
      subscription3.subscription = {} as PushSubscriptionDto;
      const subscriptions: SubscriberDto[] = [
        subscription1,
        subscription2,
        subscription3,
      ];
      const messageDto = {} as DistributionMessageDto;
      const expectedResult = [
        {
          name: 'email',
          data: {
            to: 'nolan.bushnell@atari.com',
            timeZone: undefined,
            subject: undefined,
            text: 'the-manual-for-the-original-mario-kart-encouraged-screen-peeking',
            template: 'super-mario-kart',
            html: undefined,
            context: undefined,
          },
        },
        {
          name: 'email',
          data: {
            to: 'johnathan.blackley@xbox.com',
            timeZone: undefined,
            subject: undefined,
            text: 'the-manual-for-the-original-mario-kart-encouraged-screen-peeking',
            template: 'super-mario-kart',
            html: undefined,
            context: undefined,
          },
        },
        {
          name: 'sms',
          data: {
            to: '+12345678910',
            timeZone: undefined,
            template: 'super-mario-kart',
            body: 'the-manual-for-the-original-mario-kart-encouraged-screen-peeking',
            context: undefined,
          },
        },
        {
          name: 'push-notification',
          data: {
            subscription: {},
            template: 'super-mario-kart',
            platform: 'ios',
            timeZone: undefined,
            context: undefined,
          },
        },
      ];

      // Act.
      const result = createNotificationJobs(
        distributionRule,
        subscriptions,
        messageDto,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });
  });

  describe('hasDeliveryMethods()', () => {
    it('should yield true if a subscription has at least one delivery method enabled', () => {
      // Arrange.
      const deliveryMethods: DeliveryMethods[] = [
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
      ];
      const dto = new UserSubscriberDto();
      dto.deliveryMethods = [DeliveryMethods.CALL, DeliveryMethods.EMAIL];

      // Act.
      const result = hasDeliveryMethods(deliveryMethods, dto);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if a subscription does not have at least one delivery method enabled', () => {
      // Arrange.
      const deliveryMethods: DeliveryMethods[] = [
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
      ];
      const dto = new UserSubscriberDto();
      dto.deliveryMethods = [DeliveryMethods.CALL];

      // Act.
      const result = hasDeliveryMethods(deliveryMethods, dto);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('hasDeliveryWindow()', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-07-06T09:59:07.307Z'));
    });

    it("should yield true if the current day and time are within a subscription's delivery window", () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: true,
      } as DistributionRule;
      const SubscriberDto = new UserSubscriberDto();
      SubscriberDto.deliveryWindows = [
        { dayOfWeek: 4, atHour: 4, atMinute: 30, duration: 120 },
      ];
      SubscriberDto.timeZone = 'America/Chicago';

      // Act.
      const result = hasDeliveryWindow(distributionRule, SubscriberDto);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if a distribution rule does not check delivery windows', () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: false,
      } as DistributionRule;

      // Act.
      const result = hasDeliveryWindow(
        distributionRule,
        new UserSubscriberDto(),
      );

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if a sbuscription is an instance of a "DeviceSubscriberDto"', () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: true,
      } as DistributionRule;
      const SubscriberDto = new DeviceSubscriberDto();

      // Act.
      const result = hasDeliveryWindow(distributionRule, SubscriberDto);

      // Assert.
      expect(result).toBeTruthy();
    });

    it("should yield false if the current day and time are not within a subscription's delivery window", () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: true,
      } as DistributionRule;
      const SubscriberDto = new UserSubscriberDto();
      SubscriberDto.deliveryWindows = [
        { dayOfWeek: 4, atHour: 12, atMinute: 30, duration: 120 },
      ];
      SubscriberDto.timeZone = 'America/Chicago';

      // Act.
      const result = hasDeliveryWindow(distributionRule, SubscriberDto);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the subscription does not have delivery windows for the day', () => {
      // Arrange.
      const distributionRule = {
        checkDeliveryWindow: true,
      } as DistributionRule;
      const SubscriberDto = new UserSubscriberDto();
      SubscriberDto.deliveryWindows = [
        { dayOfWeek: 6, atHour: 9, atMinute: 30, duration: 120 },
      ];
      SubscriberDto.timeZone = 'America/Chicago';

      // Act.
      const result = hasDeliveryWindow(distributionRule, SubscriberDto);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('isBetweenTimes()', () => {
    const startTime = DateTime.fromJSDate(new Date('2023-07-06T09:59:07.307Z'));
    const duration = 120;

    it('should yield true if the time is equal to the start time', () => {
      // Arrange.
      const time = DateTime.fromJSDate(new Date('2023-07-06T09:59:07.307Z'));

      // Act.
      const result = isBetweenTimes(time, startTime, duration);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the time is greater than the start stime and less than the end time', () => {
      // Arrange.
      const time = DateTime.fromJSDate(new Date('2023-07-06T10:45:00.000Z'));

      // Act.
      const result = isBetweenTimes(time, startTime, duration);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the time is equal to the end time', () => {
      // Arrange.
      const time = DateTime.fromJSDate(new Date('2023-07-06T11:59:07.307Z'));

      // Act.
      const result = isBetweenTimes(time, startTime, duration);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the time is less than the start time', () => {
      // Arrange.
      const time = DateTime.fromJSDate(new Date('2023-07-06T09:59:06.307Z'));

      // Act.
      const result = isBetweenTimes(time, startTime, duration);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield true if the time is greater than the end time', () => {
      // Arrange.
      const time = DateTime.fromJSDate(new Date('2023-07-06T11:59:08.307Z'));

      // Act.
      const result = isBetweenTimes(time, startTime, duration);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('zeroToOneDayIndex', () => {
    it('should yield 1 for Monday', () => {
      // Assert.
      expect(zeroToOneDayIndex(1)).toBe(1);
    });

    it('should yield 2 for Tuesday', () => {
      // Assert.
      expect(zeroToOneDayIndex(2)).toBe(2);
    });

    it('should yield 3 for Wednesday', () => {
      // Assert.
      expect(zeroToOneDayIndex(3)).toBe(3);
    });

    it('should yield 4 for Thursday', () => {
      // Assert.
      expect(zeroToOneDayIndex(4)).toBe(4);
    });

    it('should yield 5 for Friday', () => {
      // Assert.
      expect(zeroToOneDayIndex(5)).toBe(5);
    });

    it('should yield 6 for Saturday', () => {
      // Assert.
      expect(zeroToOneDayIndex(6)).toBe(6);
    });

    it('should yield 7 for Sunday', () => {
      // Assert.
      expect(zeroToOneDayIndex(0)).toBe(7);
    });
  });

  describe('reduceToDeliveryMethodsMap()', () => {
    // Todo: Unit Test the reduceToDevliveryMethodsMap function.
  });

  describe('mapToNotificationJobs()', () => {
    it('should yield a list of unique notification jobs (email)', () => {
      // Arrange.
      const recipients: Recipient[] = [
        new Recipient('nathan.drake@email.com', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('nathan.drake@email.com', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('solid.snake@email.com', {
          timeZone: 'America/Detroit',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
      ];
      const distributionRule = {
        emailSubject: 'PlayStation Characters',
        text: 'A meeting between PlayStation characters and developers.',
        emailTemplate: 'playstation-characters',
        html: null,
      } as DistributionRule;
      const payload = {};
      const expectedResult = recipients.map((recipient) => ({
        name: DeliveryMethods.EMAIL,
        data: {
          to: recipient.value,
          timeZone: recipient.subscription.timeZone,
          subject: distributionRule.emailSubject,
          text: distributionRule.text,
          template: distributionRule.emailTemplate,
          html: distributionRule.html,
          context: payload,
        },
      }));
      expectedResult.splice(1, 1);

      // Act.
      const result = mapToNotificationJobs(
        DeliveryMethods.EMAIL,
        recipients,
        distributionRule,
        payload,
        null,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield a list of unique notification jobs (sms)', () => {
      // Arrange.
      const recipients: Recipient[] = [
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('+19998887777', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
      ];
      const distributionRule = {
        smsTemplate: 'did-you-know-pac-man-was-originally-puckman?',
      } as DistributionRule;
      const payload = {};
      const expectedResult = recipients.map((recipient) => ({
        name: DeliveryMethods.SMS,
        data: {
          to: recipient.value,
          timeZone: recipient.subscription.timeZone,
          template: distributionRule.smsTemplate,
          body: distributionRule.text,
          context: payload,
        },
      }));
      expectedResult.splice(2, 1);

      // Act.
      const result = mapToNotificationJobs(
        DeliveryMethods.SMS,
        recipients,
        distributionRule,
        payload,
        null,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield a list of unique notification jobs (call)', () => {
      // Arrange.
      const recipients: Recipient[] = [
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('+19998887777', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriberDto),
      ];
      const distributionRule = {
        callTemplate: 'nintendo-was-founded-in-1889',
      } as DistributionRule;
      const payload = {};
      const expectedResult = recipients.map((recipient) => ({
        name: DeliveryMethods.CALL,
        data: {
          to: recipient.value,
          timeZone: recipient.subscription.timeZone,
          template: distributionRule.callTemplate,
          context: payload,
        },
      }));
      expectedResult.splice(2, 1);

      // Act.
      const result = mapToNotificationJobs(
        DeliveryMethods.CALL,
        recipients,
        distributionRule,
        payload,
        null,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield a list of unique notification jobs (push)', () => {
      // Arrange.
      const recipients: Recipient[] = [
        new Recipient('atari', {
          timeZone: 'America/Chicago',
          platform: Platform.WEB,
        } as DeviceSubscriberDto),
        new Recipient('sega-genesis', {
          timeZone: 'America/Detroit',
          platform: Platform.WEB,
        } as DeviceSubscriberDto),
        new Recipient('atari', {
          timeZone: 'America/Chicago',
          platform: Platform.WEB,
        } as DeviceSubscriberDto),
      ];
      const distributionRule = {
        pushTemplate:
          'sonic-the-hedgehog-was-the-first-video-game-character-in-macys-parade',
      } as DistributionRule;
      const payload = {};
      const expectedResult = recipients.map((recipient) => ({
        name: DeliveryMethods.PUSH,
        data: {
          subscription: recipient.value,
          template: distributionRule.pushTemplate,
          platform: (recipient.subscription as DeviceSubscriberDto).platform,
          timeZone: recipient.subscription.timeZone,
          context: payload,
        },
      }));
      expectedResult.splice(2, 1);

      // Act.
      const result = mapToNotificationJobs(
        DeliveryMethods.PUSH,
        recipients,
        distributionRule,
        payload,
        null,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it("should override the recipient's time zone if the time zone argument is defined", () => {
      // Arrange.
      const recipients: Recipient[] = [
        new Recipient('gunpei.yokoi@email.com', {
          timeZone: 'Japan',
          deliveryMethods: [DeliveryMethods.EMAIL],
        } as SubscriberDto),
      ];
      const distributionRule = {
        emailSubject: 'Game Boy Creator',
        text: 'Did you know the creator of the Game Boy was a janitor at Nintendo?',
        emailTemplate: null,
        html: '<p>He was first asked to develop toys for Nintendo after the president visited his factory, and saw a prototype he had developed.</p>',
      } as DistributionRule;
      const payload = {};
      const overrideTimeZone = 'America/Detroit';
      const expectedResult = recipients.map((recipient) => ({
        name: DeliveryMethods.EMAIL,
        data: {
          to: recipient.value,
          timeZone: overrideTimeZone,
          subject: distributionRule.emailSubject,
          text: distributionRule.text,
          template: distributionRule.emailTemplate,
          html: distributionRule.html,
          context: payload,
        },
      }));

      // Act.
      const result = mapToNotificationJobs(
        DeliveryMethods.EMAIL,
        recipients,
        distributionRule,
        payload,
        overrideTimeZone,
      );

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if a delivery method cannot be identified', () => {
      // Arrange.
      const method: any = 'mega-drive';
      const recipients: Recipient[] = [
        new Recipient('hayao.nakayama@email.com', {
          timeZone: 'Japan',
          deliveryMethods: [DeliveryMethods.EMAIL],
        } as SubscriberDto),
      ];
      const expectedResult = new Error(
        `Invalid Argument: Could not map deliveryMethod=${method} to notification job`,
      );

      // Act.
      const fn = mapToNotificationJobs.bind(
        null,
        method,
        recipients,
        {},
        {},
        null,
      );

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });
});
