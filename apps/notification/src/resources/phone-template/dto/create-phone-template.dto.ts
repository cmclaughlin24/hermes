import { DeliveryMethods, PhoneMethods } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { Allow, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreatePhoneTemplateDto {
  @ApiProperty({
    description: 'Name of the phone template',
    example: 'order-confirmation',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Delivery method for the phone notification',
    enum: [DeliveryMethods.CALL, DeliveryMethods.SMS],
  })
  @IsIn([DeliveryMethods.CALL, DeliveryMethods.SMS])
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  deliveryMethod: PhoneMethods;

  @ApiProperty({
    description:
      'Message (SMS) or TwiML (call) template that can accept values from a nested JavaScript object',
    example:
      '<Response><Say>You order for {{ product.quantity }} has been received! Your total is ${{ total }}</Say></Response>',
    externalDocs: {
      url: 'https://www.twilio.com/docs/voice/twiml',
      description: 'TwiML',
    },
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template: string;

  @ApiProperty({
    description: 'Example of the values to be passed to the template',
    example: {
      product: {
        type: 'string',
        quantity: 'number',
      },
      total: 'number',
    },
  })
  @Allow()
  context: any;
}
