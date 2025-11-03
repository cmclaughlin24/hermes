import { Field, InputType } from '@nestjs/graphql';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePermissionInput } from '../../permission/dto/create-permission.input';

@InputType()
export class CreateApiKeyInput {
  @Field({
    description: 'Common name or label associated with the api key.',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @Field({
    description:
      "An array of the api key's permissions that determine whether a request is " +
      'allowed or denied.',
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions: CreatePermissionInput[];
}
