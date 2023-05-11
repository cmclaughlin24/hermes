import { ApiProperty } from '@nestjs/swagger';
import { DeliveryMethods } from '@notification/common';
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
      'Label selectors used to identify which rule should be applied for an event (for a ' +
      'rule to be selected, all selectors must match)',
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
    example: [DeliveryMethods.EMAIL, DeliveryMethods.SMS],
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
      'Plain text template that can accept values from a nested JavaScript object',
    example:
      '{{firstName}} {{lastName}} successfully sent a {{message.type}} notification!',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;

  @ApiProperty({
    description:
      'If the application should check the current time is within the delivery window(s) ' +
      'for each subscription',
  })
  @IsBoolean()
  @IsOptional()
  checkDeliveryWindow?: boolean;
}
