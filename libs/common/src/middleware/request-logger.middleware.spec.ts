import { RequestLoggerMiddleware } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new RequestLoggerMiddleware()).toBeDefined();
  });

  describe('use()', () => {
    let requestLogger: RequestLoggerMiddleware;

    beforeEach(() => {
      requestLogger = new RequestLoggerMiddleware();
    });

    afterEach(() => {
      requestLogger = null;
    });

    it.todo('investigate how to unit test middlewares');
  });
});
