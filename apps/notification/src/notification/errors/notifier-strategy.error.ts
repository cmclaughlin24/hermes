import { DeliveryMethods } from '@hermes/common';

export class NotifierStrategyException extends Error {
  constructor(type: DeliveryMethods) {
    super(
      `Invalid Delivery Method: ${type} does not have a defined NotifierStrategy`,
    );
  }
}
