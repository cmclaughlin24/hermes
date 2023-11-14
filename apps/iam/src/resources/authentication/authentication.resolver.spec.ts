import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

type MockAuthenticationService = Partial<
  Record<keyof AuthenticationService, jest.Mock>
>;

const createAuthenticationServiceMock = (): MockAuthenticationService => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  verifyToken: jest.fn(),
  refreshToken: jest.fn(),
});

describe('AuthenticationResolver', () => {
  let resolver: AuthenticationResolver;
  let service: MockAuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationResolver,
        {
          provide: AuthenticationService,
          useValue: createAuthenticationServiceMock(),
        },
      ],
    }).compile();

    resolver = module.get<AuthenticationResolver>(AuthenticationResolver);
    service = module.get<MockAuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signUp()', () => {
    it.todo('should yield true if...');

    it.todo('should yield false otherwise');

    it.todo('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if...');
  });

  describe('signIn()', () => {
    it.todo('should yield a "Tokens" object');

    it.todo('a "GraphQLError" with a "UNAUTHENTICATED" code if...');

    it.todo('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if...');
  });

  describe('verifyToken()', () => {
    it.todo('should yield an "ActiveUser" object');

    it.todo('a "GraphQLError" with a "UNAUTHENTICATED" code if...');
  });

  describe('refreshToken()', () => {
    it.todo('should yield a "Tokens" object');

    it.todo('a "GraphQLError" with a "UNAUTHENTICATED" code if...');
  });
});
