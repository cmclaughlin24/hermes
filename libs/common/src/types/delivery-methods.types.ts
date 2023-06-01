export enum DeliveryMethods {
  EMAIL = 'email',
  SMS = 'sms',
  CALL = 'call',
  PUSH = 'push-notification',
}

export type PhoneMethods = DeliveryMethods.CALL | DeliveryMethods.SMS;
