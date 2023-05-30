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
import { DistributionEventExists } from '../../../common/decorators/distribution-event-exists.decorator';

export class CreateDistributionRuleDto {
  @ApiProperty({
    description: 'Name of the Rabbitmq queue the message is consumed from',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  queue: string;

  @ApiProperty({
    description: 'The message the rule should be applied to',
  })
  @IsString()
  @IsNotEmpty()
  @DistributionEventExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  messageType: string;

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
  @Transform(({ value }: TransformFnParams) =>
    value ? JSON.stringify(value) : null,
  )
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
    description: 'Name of a SMS template in the Notification Service',
    example: 'template',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  callTemplate?: string;

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

  @ApiProperty({
    description:
      "Metadata label for the time zone. If present, will set label's value in the " +
      "NotificationDto instead of the user's time zone.",
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  timeZoneLabel?: string;
}
