import {
  ApiResponseDto,
  ExistsException,
  MissingException,
} from '@hermes/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockSubscriptionService,
  createSubscriptionServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './repository/entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: MockSubscriptionService;

  const subscription: Subscription = {
    subscriberId: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
    data: { url: 'http://localhost:9999/subscriptions' },
    filterJoin: 'and',
  } as Subscription;
  const eventType = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: createSubscriptionServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get<MockSubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of subscriptions', async () => {
      // Arrange.
      const expectedResult: Subscription[] = [subscription];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException('Subscriptions not found!');
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException('Subscriptions not found!');
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll()).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield a subscription', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(
        controller.findOne('', subscription.subscriberId),
      ).resolves.toEqual(subscription);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Subscription with eventType=${eventType} subscriberId=${subscription.subscriberId} not found!`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.findOne(eventType, subscription.subscriberId),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('create()', () => {
    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<Subscription>(
        `Successfully created subscription!`,
        subscription,
      );
      service.create.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(
        controller.create({} as CreateSubscriptionDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the distribution event does not exist', async () => {
      // Arrange.
      const errorMessage = `Distribution Event for eventType=${eventType} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.create.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({
          subscriberId: subscription.subscriberId,
        } as CreateSubscriptionDto),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw a "BadRequestException" if the subscription already exists', async () => {
      // Arrange.
      const errorMessage = `Subscription ${subscription.subscriberId} already exists!`;
      const expectedResult = new BadRequestException(errorMessage);
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(
        controller.create({
          subscriberId: subscription.subscriberId,
        } as CreateSubscriptionDto),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    afterEach(() => {
      service.update.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<Subscription>(
        `Successfully updated subscription!`,
        subscription,
      );
      service.update.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(
        controller.update(
          '',
          subscription.subscriberId,
          {} as UpdateSubscriptionDto,
        ),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the subscription does not exist', async () => {
      // Arrange.
      const errorMessage = `Subscription with eventType=${eventType} subscriberId=${subscription.subscriberId} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.update.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.update(
          eventType,
          subscription.subscriberId,
          {} as UpdateSubscriptionDto,
        ),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('removeAll()', () => {
    afterEach(() => {
      service.removeAll.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted subscription subscriberId=${subscription.subscriberId} from all distribution event(s)!`,
      );
      service.removeAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.removeAll(subscription.subscriberId),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the subscription does not exist', async () => {
      // Arrange.
      const errorMessage = `Subscription(s) with subscriberId=${subscription.subscriberId} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.removeAll.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.removeAll(subscription.subscriberId),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const eventType = 'unit-test';
      const expectedResult = new ApiResponseDto(
        `Successfully deleted subscription eventType=${eventType} subscriberId=${subscription.subscriberId}!`,
      );
      service.remove.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        controller.remove(eventType, subscription.subscriberId),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the subscription does not exist', async () => {
      // Arrange.
      const errorMessage = `Subscription with eventType=${eventType} subscriberId=${subscription.subscriberId} not found!`;
      const expectedResult = new NotFoundException(errorMessage);
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(
        controller.remove(eventType, subscription.subscriberId),
      ).rejects.toEqual(expectedResult);
    });
  });
});
