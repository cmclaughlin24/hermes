import { INestApplication, ValidationPipe } from '@nestjs/common';

export function useGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      // Note: whitelist will strip out properties not defined in the DTO/transform will convert payloads into instances
      //       of the DTO and does primitive type conversions.
      whitelist: true,
      transform: true,
    }),
  );
}
