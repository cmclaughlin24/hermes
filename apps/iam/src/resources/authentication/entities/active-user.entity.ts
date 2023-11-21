import { ActiveUserData } from '@hermes/iam';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveUser implements ActiveUserData {
  sub: string;
  permissions: string[];
}
