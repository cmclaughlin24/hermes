import { DeliveryMethods } from '@hermes/common';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockDistributionEventService,
  createConfigServiceMock,
  createDistributionEventServiceMock,
} from '../../../../test/helpers/provider.helper';
import {
  MockQueue,
  createQueueMock,
} from '../../../../test/helpers/queue.helper';
import { DistributionMessageDto } from '../../../common/dto/distribution-message.dto';
import { SubscriberService } from '../../../common/providers/subscriber/subscriber.service';
import { SubscriptionType } from '../../../common/types/subscription-type.type';
import { filterSubscriptions } from '../../../common/utils/subscription-filter.utils';
import { DistributionEventService } from '../../../resources/distribution-event/distribution-event.service';
import { MqResponse } from '../../classes/mq-response.class';
import { MqUnrecoverableError } from '../../classes/mq-unrecoverable-error.class';
import { MqInterceptor } from '../../interceptors/mq/mq.interceptor';
import { DistributionConsumer } from './distribution.consumer';

jest.mock('../../../common/utils/subscription-filter.utils');

class MqInterceptorMock {}

type MockSubscriberService = Partial<
  Record<keyof SubscriberService, jest.Mock>
>;

const createSubcriberServiceMock = (): MockSubscriberService => ({
  get: jest.fn(),
});

describe('DistributionConsumer', () => {
  let consumer: DistributionConsumer;
  let distributionEventService: MockDistributionEventService;
  let subscriberService: MockSubscriberService;
  let queue: MockQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionConsumer,
        {
          provide: getQueueToken(process.env.BULLMQ_NOTIFICATION_QUEUE),
          useValue: createQueueMock(),
        },
        {
          provide: DistributionEventService,
          useValue: createDistributionEventServiceMock(),
        },
        {
          provide: SubscriberService,
          useValue: createSubcriberServiceMock(),
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
      ],
    })
      .overrideInterceptor(MqInterceptor)
      .useClass(MqInterceptorMock)
      .compile();

    consumer = module.get<DistributionConsumer>(DistributionConsumer);
    distributionEventService = module.get<MockDistributionEventService>(
      DistributionEventService,
    );
    subscriberService = module.get<MockSubscriberService>(SubscriberService);
    queue = module.get<MockQueue>(
      getQueueToken(process.env.BULLMQ_NOTIFICATION_QUEUE),
    );
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('subscribe()', () => {
    const distributionEvent = {
      queue: 'distribution',
      eventType: 'console-release',
      metadataLabels: [],
      rules: [
        {
          metadata: null,
          deliveryMethods: [DeliveryMethods.EMAIL],
        },
      ],
    };
    const message = {
      id: '984f18bf-e044-4a74-98ae-c830341c8a69',
      type: 'mega-drive',
      metadata: {
        languageCode: 'en-us',
      },
      payload: {},
      addedAt: '1989-11-29T17:20:16.040Z',
    };

    beforeEach(() => {
      distributionEventService.findOne.mockResolvedValue(distributionEvent);
    });

    afterEach(() => {
      distributionEventService.findOne.mockClear();
      subscriberService.get.mockClear();
      // @ts-ignore
      filterSubscriptions.mockClear();
    });

    it('should create notification job(s) for a distribution event', async () => {
      // Arrange.
      // @ts-ignore
      filterSubscriptions.mockReturnValue([
        {
          id: '',
          externalId: '',
          distributionEventId: '',
          subscriptionType: SubscriptionType.USER,
        },
      ]);
      subscriberService.get.mockResolvedValue([
        {
          deliveryMethods: [DeliveryMethods.EMAIL],
          getDeliveryWindows: (dayOfWeek: number) => null,
          getDeliveryMethod: (deliveryMethod: DeliveryMethods) => {
            switch (deliveryMethod) {
              case DeliveryMethods.EMAIL:
                return 'donkey.kong@nintendo.com';
              default:
                return null;
            }
          },
        },
      ]);
      queue.addBulk.mockResolvedValue([{}]);

      // Act.
      await consumer.subscribe(message, null);

      // Assert.
      expect(queue.addBulk).toHaveBeenCalled();
    });

    it('should yield a "MqResponse" object that indicates the number of notification(s) created', async () => {
      // Arrange.
      const notifications = [{}];
      const expectedResult = new MqResponse(
        `Successfully added ${notifications.length} notification(s) to queue`,
      );
      // @ts-ignore
      filterSubscriptions.mockReturnValue([
        {
          id: '',
          externalId: '',
          distributionEventId: '',
          subscriptionType: SubscriptionType.USER,
        },
      ]);
      subscriberService.get.mockResolvedValue([
        {
          deliveryMethods: [DeliveryMethods.EMAIL],
          getDeliveryWindows: (dayOfWeek: number) => null,
          getDeliveryMethod: (deliveryMethod: DeliveryMethods) => {
            switch (deliveryMethod) {
              case DeliveryMethods.EMAIL:
                return 'bowser.junior@nintendo.com';
              default:
                return null;
            }
          },
        },
      ]);
      queue.addBulk.mockResolvedValue(notifications);

      // Act/Assert.
      await expect(consumer.subscribe(message, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a "MqResponse" object that indicates there are no subscribers for a distribution event', async () => {
      // Arrange.
      const expectedResult = new MqResponse(
        'Distribution event does not have any subscribers',
      );

      // Act/Assert.
      await expect(consumer.subscribe(message, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield a "MqResponse" object that indicates there are no subscriber(s) w/matching delivery methods or notification windows', async () => {
      // Arrange.
      const expectedResult = new MqResponse(
        "Distribution event does not have subscriber(s) matching the distribution rule's delivery methods or notficiation windows",
      );
      // @ts-ignore
      filterSubscriptions.mockReturnValue([
        {
          id: '',
          externalId: '',
          distributionEventId: '',
          subscriptionType: SubscriptionType.USER,
        },
      ]);
      subscriberService.get.mockResolvedValue([{ deliveryMethods: [] }]);

      // Act/Assert.
      await expect(consumer.subscribe(message, null)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should rethrow any errors so the MqInterceptor may handle them', async () => {
      // Act/Assert.
      await expect(consumer.subscribe({}, null)).rejects.toThrow();
    });

    it('should throw a "MqUnrecoverableError" if a distribution event does not have a default distribution rule', async () => {
      // Arrange.
      const invalidDistributionEvent = {
        queue: 'distribution',
        eventType: 'console-release',
        metadataLabels: [],
        rules: [],
      };
      const expectedResult = new MqUnrecoverableError(
        `Distribution Event queue=${invalidDistributionEvent.queue} eventType=${invalidDistributionEvent.eventType} does not have a default distribution rule defined!`,
      );
      distributionEventService.findOne.mockResolvedValue(
        invalidDistributionEvent,
      );

      // Act/Assert.
      await expect(consumer.subscribe(message, null)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('createMessageDto()', () => {
    const message = {
      id: 'e63dde9d-606c-4938-b9aa-86813de1f09f',
      type: 'unit-test',
      metadata: null,
      payload: {},
      addedAt: new Date().toISOString(),
      timeZone: 'America/Chicago',
    };

    it('should yield a valid "DistributionMessageDto" object', async () => {
      // Arrange.
      const expectedResult = new DistributionMessageDto();
      expectedResult.id = message.id;
      expectedResult.type = message.type;
      expectedResult.metadata = message.metadata;
      expectedResult.payload = message.payload;
      expectedResult.addedAt = message.addedAt;
      expectedResult.timeZone = message.timeZone;

      // Act/Assert.
      await expect(consumer.createMessageDto(message)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an "MqUnrecoverableError" if the created "MessageDto" is invalid', async () => {
      // Arrange.
      const invalidMessage = {
        ...message,
        type: null,
      };

      // Act/Assert.
      await expect(
        consumer.createMessageDto(invalidMessage),
      ).rejects.toBeInstanceOf(MqUnrecoverableError);
    });
  });
});
