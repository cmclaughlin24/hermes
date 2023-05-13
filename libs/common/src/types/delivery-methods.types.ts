export enum DeliveryMethods {
  EMAIL = 'email',
  SMS = 'sms',
  CALL = 'call',
}

export type PhoneMethods = DeliveryMethods.CALL | DeliveryMethods.SMS;
