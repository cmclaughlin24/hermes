import { ActiveEntity as IamActiveEntity } from '@hermes/iam';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveEntity implements IamActiveEntity {
  sub: string;
  authorization_details: string[];
}
