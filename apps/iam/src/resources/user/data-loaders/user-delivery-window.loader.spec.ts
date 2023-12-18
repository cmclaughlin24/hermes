import { Test, TestingModule } from '@nestjs/testing';
import { createUserServiceMock } from '../../../../test/helpers/provider.helper';
import { UserService } from '../user.service';
import { UserDeliveryWindowLoader } from './user-delivery-window.loader';

describe('UserDeliveryWindowLoader', () => {
  let provider: UserDeliveryWindowLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeliveryWindowLoader,
        {
          provide: UserService,
          useValue: createUserServiceMock(),
        },
      ],
    }).compile();

    provider = await module.resolve<UserDeliveryWindowLoader>(
      UserDeliveryWindowLoader,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
