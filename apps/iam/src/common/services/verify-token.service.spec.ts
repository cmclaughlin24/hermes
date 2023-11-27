import { ActiveEntity } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockJwtService,
  createConfigServiceMock,
  createJwtServiceMock,
} from '../../../test/helpers/provider.helper';
import { VerifyTokenService } from './verify-token.service';

describe('VerifyTokenService', () => {
  let service: VerifyTokenService;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyTokenService,
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: JwtService,
          useValue: createJwtServiceMock(),
        },
      ],
    }).compile();

    service = module.get<VerifyTokenService>(VerifyTokenService);
    jwtService = module.get<MockJwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAccessToken()', () => {
    const token = 'marin-of-mabe-village';

    afterEach(() => {
      jwtService.verifyAsync.mockClear();
    });

    it('should yield the "ActiveEntity" if the token is valid', async () => {
      // Arrange.
      const expectedResult: ActiveEntity = {
        sub: randomUUID(),
        authorization_details: [],
      };
      jwtService.verifyAsync.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.verifyAccessToken(token)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an error if the token is invalid', async () => {
      // Arrange.
      const expectedResult = new Error();
      jwtService.verifyAsync.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.verifyAccessToken(token)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
