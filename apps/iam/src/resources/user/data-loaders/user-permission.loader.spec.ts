import { Test, TestingModule } from '@nestjs/testing';
import { createUserServiceMock } from '../../../../test/helpers/provider.helper';
import { UserService } from '../user.service';
import { UserPermissionLoader } from './user-permission.loader';

describe('UserPermissionLoader', () => {
  let provider: UserPermissionLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPermissionLoader,
        {
          provide: UserService,
          useValue: createUserServiceMock(),
        },
      ],
    }).compile();

    provider = await module.resolve<UserPermissionLoader>(UserPermissionLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
