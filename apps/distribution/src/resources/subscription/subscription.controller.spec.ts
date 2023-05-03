import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import {
  MockSubscriptionService,
  createSubscriptionServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: MockSubscriptionService;

  const subscription: Subscription = {
    id: '8544f373-8442-4307-aaa0-f26d4f7b30b1',
    url: 'http://localhost:9999/subscriptions',
    filterJoin: 'and',
  } as Subscription;

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
    it('should yield a list of subscriptions', async () => {
      // Arrange.
      const expectedResult: Subscription[] = [subscription];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll()).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield a subscription', async () => {
      // Arrange.
      service.findOne.mockResolvedValue(subscription);

      // Act/Assert.
      await expect(controller.findOne(subscription.id)).resolves.toEqual(
        subscription,
      );
    });
  });

  describe('create()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<Subscription>(
        `Successfully created subscription!`,
        subscription,
      );
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.create({} as CreateSubscriptionDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto<Subscription>(
        `Successfully updated subscription!`,
        subscription,
      );
      service.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.update(subscription.id, {} as UpdateSubscriptionDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully deleted subscription ${subscription.id}!`,
      );
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.remove(subscription.id)).resolves.toEqual(
        expectedResult,
      );
    });
  });
});
