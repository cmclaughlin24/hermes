import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockUserService,
  createUserServiceMock,
} from '../../../../test/helpers/provider.helper';
import { DeliveryWindow } from '../entities/delivery-window.entity';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';
import { UserDeliveryWindowResolver } from './user-delivery-window.resolver';

describe('DeliveryWindowResolver', () => {
  let resolver: UserDeliveryWindowResolver;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeliveryWindowResolver,
        {
          provide: UserService,
          useValue: createUserServiceMock(),
        },
      ],
    }).compile();

    resolver = module.get<UserDeliveryWindowResolver>(
      UserDeliveryWindowResolver,
    );
    userService = module.get<MockUserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUserDeliveryWindows()', () => {
    afterEach(() => {
      userService.findUserDeliveryWindows.mockClear();
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
      userService.findUserDeliveryWindows.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        resolver.getUserDeliveryWindows({ id: randomUUID() } as User),
      ).resolves.toEqual(expectedResult);
    });
  });
});
