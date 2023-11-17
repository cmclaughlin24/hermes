import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../services/token.service';
import { AccessTokenGuard } from './access-token.guard';

type MockTokenService = Partial<Record<keyof TokenService, jest.Mock>>;

const createTokenServiceMock = (): MockTokenService => ({
  verifyAccessToken: jest.fn(),
});

describe('AccessTokenGuard', () => {
  let tokenService: MockTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TokenService,
          useValue: createTokenServiceMock(),
        },
      ],
    }).compile();

    tokenService = module.get<MockTokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(new AccessTokenGuard(tokenService as TokenService)).toBeDefined();
  });

  describe('canActivate()', () => {
    let accessTokenGuard: AccessTokenGuard;

    beforeEach(() => {
      accessTokenGuard = new AccessTokenGuard(tokenService as TokenService);
    });

    afterEach(() => {
      accessTokenGuard = null;
    });

    it('should yield true if the access token is valid', async () => {
      // Arrange.
      const context: any = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({
            headers: { authorization: 'Bearer super-mario-wonder' },
          })),
        })),
      };
      tokenService.verifyAccessToken.mockResolvedValue({});

      // Act/Assert.
      await expect(accessTokenGuard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should throw an "UnauthorizedException" if the authorization header does not include a token', async () => {
      // Arrange.
      const context: any = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({ headers: {} })),
        })),
      };
      const expectedResult = new UnauthorizedException();

      // Act/Assert.
      await expect(accessTokenGuard.canActivate(context)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an "UnauthorizedException" if the access token is invalid', async () => {
      // Arrange.
      const context: any = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({
            headers: { authorization: 'Bearer super-mario-wonder' },
          })),
        })),
      };
      const expectedResult = new UnauthorizedException();
      tokenService.verifyAccessToken.mockRejectedValue({});

      // Act/Assert.
      await expect(accessTokenGuard.canActivate(context)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
