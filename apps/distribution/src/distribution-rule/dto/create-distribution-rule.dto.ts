import { DeliveryMethods } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import * as _ from 'lodash';

export class CreateDistributionRuleDto {
  @ApiProperty({
    description: 'The event the rule should be applied to',
  })
  @IsString()
  @IsNotEmpty()
  // Todo: Renable after solution for E2E Tests can be identified. @DistributionEventExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  eventType: string;

  @ApiProperty({
    description:
      'Label selectors (key-value pairs) used to identify which rule should be applied for an ' +
      'event (for a rule to be selected, all selectors must match or the default rule will be applied)',
    example: {
      languageCode: 'en-US',
    },
  })
  @IsJSON()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    // Note: Sort the metadata keys alphabetically so that the unique constraint will
    //       be applied correctly.
    if (!value) {
      return null;
    }

    const sorted = _.chain(value)
      .toPairs()
      .orderBy([0], ['asc'])
      .fromPairs()
      .value();

    return JSON.stringify(sorted);
  })
  metadata: string;

  @ApiProperty({
    description: 'How to deliver notifications for an event',
    enum: DeliveryMethods,
    example: [DeliveryMethods.EMAIL, DeliveryMethods.SMS, DeliveryMethods.CALL],
  })
  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[];

  @ApiProperty({
    description:
      'Subject template that can accept values from a nested JavaScript object',
    example: "{{firstName}}'s first notification!",
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  emailSubject?: string;

  @ApiProperty({
    description:
      'Name of an email template in the Notification Service (overrides "html" property if provided)',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  emailTemplate?: string;

  @ApiProperty({
    description:
      'Handlebars HTML template for the email body (overridden if "emailTemplate" property is provided)',
    example: '<body><main><h1>{{title}}</h1></main></body>',
    externalDocs: {
      url: 'https://handlebarsjs.com/',
      description: 'Handlebars',
    },
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  html?: string;

  @ApiProperty({
    description:
      'Plain text template that can accept values from a nested JavaScript object. When present, used ' +
      'in the EmailNotificationDto as a plain text body or in the PhoneNotificationDto (SMS) as the message',
    example:
      '{{firstName}} {{lastName}} successfully sent a {{message.type}} notification!',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;

  @ApiProperty({
    description:
      'Name of a SMS template in the Notification Service (overrides "text" property if provided)',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  smsTemplate?: string;

  @ApiProperty({
    description: 'Name of a call template in the Notification Service',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  callTemplate?: string;

  @ApiProperty({
    description:
      'Name of a push notification template in the Notification Service',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  pushTemplate?: string;

  @ApiProperty({
    description:
      'If the application should check the current time is within the delivery window(s) ' +
      'for each subscription',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  checkDeliveryWindow?: boolean;

  @ApiProperty({
    description:
      'If the application should ignore the Subscriptions and use the MessageDto "recipients" property ' +
      'to determine who should recieve a notification.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  bypassSubscriptions?: boolean;
}
