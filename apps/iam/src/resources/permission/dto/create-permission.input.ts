import { InputType } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PermissionAction } from '../enums/permission-action.enum';

@InputType()
export class CreatePermissionInput {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  resource: string;

  @IsEnum(PermissionAction)
  action: PermissionAction;
}
