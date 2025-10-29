import { AutoMap } from '@automapper/classes';
import { PhoneMethods } from '@hermes/common';

export class PhoneTemplate {
  @AutoMap()
  name: string;

  @AutoMap()
  deliveryMethod: PhoneMethods;

  @AutoMap()
  template: string;

  @AutoMap()
  context: string;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}
