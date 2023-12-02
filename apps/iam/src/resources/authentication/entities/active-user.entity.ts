import { ActiveEntityData as IamActiveEntityData } from '@hermes/iam';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveUserData implements IamActiveEntityData {
  sub: string;
  name: string;
  authorization_details: string[];
}
