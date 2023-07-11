import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createConfigServiceMock,
  createDistributionEventServiceMock,
} from '../../../../test/helpers/provider.helper';
import { createQueueMock } from '../../../../test/helpers/queue.helper';
import { DistributionMessageDto } from '../../../common/dto/distribution-message.dto';
import { SubscriptionDataService } from '../../../common/providers/subscription-data/subscription-data.service';
import { DistributionEventService } from '../../../resources/distribution-event/distribution-event.service';
import { MqUnrecoverableError } from '../../classes/mq-unrecoverable-error.class';
import { MqInterceptor } from '../../interceptors/mq/mq.interceptor';
import { DistributionConsumer } from './distribution.consumer';

class MqInterceptorMock {}

describe('DistributionConsumer', () => {
  let provider: DistributionConsumer;

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
          provide: SubscriptionDataService,
          useValue: {},
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

    provider = module.get<DistributionConsumer>(DistributionConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('subscribe()', () => {
    it('should create notification job(s) for a distribution event', async () => {});
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
      await expect(provider.createMessageDto(message)).resolves.toEqual(
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
        provider.createMessageDto(invalidMessage),
      ).rejects.toBeInstanceOf(MqUnrecoverableError);
    });
  });
});
