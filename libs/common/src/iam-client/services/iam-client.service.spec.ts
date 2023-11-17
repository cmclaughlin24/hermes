import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { IamClientService } from './iam-client.service';

type MockConfigService = Partial<Record<keyof ConfigService, jest.Mock>>;

const createConfigServiceMock = (): MockConfigService => ({
  get: jest.fn(),
});

type MockHttpService = Partial<Record<keyof HttpService, jest.Mock>>;

const createHttpServiceMock = (): MockHttpService => ({
  post: jest.fn(),
});

describe('IamClientService', () => {
  let service: IamClientService;
  let httpService: MockHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamClientService,
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: HttpService,
          useValue: createHttpServiceMock(),
        },
      ],
    }).compile();

    service = module.get<IamClientService>(IamClientService);
    httpService = module.get<MockHttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAccessToken()', () => {
    afterEach(() => {
      httpService.post.mockClear();
    });

    it('should yield the "ActiveUserData" if the token is valid', async () => {
      // Arrange.
      const expectedResult = { data: { data: { verifyAccessToken: {} } } };
      httpService.post.mockImplementation(() => of(expectedResult));

      // Act/Assert.
      await expect(service.verifyAccessToken('super-metroid')).resolves.toEqual(
        expectedResult.data.data.verifyAccessToken,
      );
    });

    it('should throw an error if the token is invalid', async () => {
      // Arrange.
      const expectedResult = new Error(
        'Samus Aran was created by Makato Kano and first appeared in the 1986 Metroid.',
      );
      httpService.post.mockImplementation(() =>
        throwError(() => expectedResult),
      );

      // Act/Assert.
      await expect(service.verifyAccessToken('ridley')).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
