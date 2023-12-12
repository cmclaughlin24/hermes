import { registerEnumType } from '@nestjs/graphql';

// Todo: Investigate using enum from library instead of duplicating.
export enum DeliveryMethods  {
  CALL = 'call',
  EMAIL = 'email',
  PUSH = 'push-notification',
  SMS = 'sms',
}

registerEnumType(DeliveryMethods, {
  name: 'DeliveryMethods',
});
