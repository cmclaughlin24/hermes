import { ActiveEntityData as IamActiveEntityData } from '@hermes/iam';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveKeyData implements IamActiveEntityData {
  sub: string;
  name: string;
  authorization_details: string[];
  exp: number;
}
