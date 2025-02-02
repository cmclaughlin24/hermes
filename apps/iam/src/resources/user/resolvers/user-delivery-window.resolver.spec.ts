import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { UserDeliveryWindowLoader } from '../data-loaders/user-delivery-window.loader';
import { DeliveryWindow } from '../repository/entities/delivery-window.entity';
import { User } from '../repository/entities/user.entity';
import { UserDeliveryWindowResolver } from './user-delivery-window.resolver';

type MockUserDeliveryWindowLoader = Partial<
  Record<keyof UserDeliveryWindowLoader, jest.Mock>
>;

const createUserDeliveryWindowLoaderMock =
  (): MockUserDeliveryWindowLoader => ({
    load: jest.fn(),
  });

describe('DeliveryWindowResolver', () => {
  let resolver: UserDeliveryWindowResolver;
  let loader: MockUserDeliveryWindowLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeliveryWindowResolver,
        {
          provide: UserDeliveryWindowLoader,
          useValue: createUserDeliveryWindowLoaderMock(),
        },
      ],
    }).compile();

    resolver = module.get<UserDeliveryWindowResolver>(
      UserDeliveryWindowResolver,
    );
    loader = await module.resolve<MockUserDeliveryWindowLoader>(UserDeliveryWindowLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUserDeliveryWindows()', () => {
    afterEach(() => {
      loader.load.mockClear();
    });

    it('should yield a list of delivery windows assigned to the user', async () => {
      // Arrange.
      const expectedResult: DeliveryWindow[] = [
        {
          id: randomUUID(),
          dayOfWeek: 1,
          atHour: 0,
          atMinute: 0,
          duration: 60,
        },
      ];
      loader.load.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        resolver.getUserDeliveryWindows({ id: randomUUID() } as User),
      ).resolves.toEqual(expectedResult);
    });
  });
});
