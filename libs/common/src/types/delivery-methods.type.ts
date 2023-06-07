export enum DeliveryMethods {
  CALL = 'call',
  EMAIL = 'email',
  PUSH = 'push-notification',
  SMS = 'sms',
}

export type PhoneMethods = DeliveryMethods.CALL | DeliveryMethods.SMS;
