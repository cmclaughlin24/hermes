import { DeliveryMethods, Platform } from '@hermes/common';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';
import { Recipient } from '../classes/recipient.class';
import { DeviceSubscriptionDto } from '../dto/device-subscription.dto';
import { SubscriptionDataDto } from '../dto/subscription-data.dto';
import { mapToNotificationJobs } from './notification-job.utils';

describe('notification-job.utils.ts', () => {
  describe('isBetweenTimes()', () => {});

  describe('reduceToDeliveryMethodsMap()', () => {});

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
        } as SubscriptionDataDto),
        new Recipient('nathan.drake@email.com', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
        new Recipient('solid.snake@email.com', {
          timeZone: 'America/Detroit',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
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
        } as SubscriptionDataDto),
        new Recipient('+19998887777', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
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
        } as SubscriptionDataDto),
        new Recipient('+19998887777', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
        new Recipient('+12223334444', {
          timeZone: 'America/Chicago',
          deliveryMethods: [
            DeliveryMethods.EMAIL,
            DeliveryMethods.SMS,
            DeliveryMethods.CALL,
          ],
        } as SubscriptionDataDto),
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
        } as DeviceSubscriptionDto),
        new Recipient('sega-genesis', {
          timeZone: 'America/Detroit',
          platform: Platform.WEB,
        } as DeviceSubscriptionDto),
        new Recipient('atari', {
          timeZone: 'America/Chicago',
          platform: Platform.WEB,
        } as DeviceSubscriptionDto),
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
          platform: (recipient.subscription as DeviceSubscriptionDto).platform,
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
        } as SubscriptionDataDto),
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
        } as SubscriptionDataDto),
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
