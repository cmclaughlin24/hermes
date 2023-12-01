import { InputType } from '@nestjs/graphql';
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
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions: CreatePermissionInput[];
}
