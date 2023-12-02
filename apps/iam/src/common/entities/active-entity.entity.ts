import { ActiveEntityData as IamActiveEntityData } from '@hermes/iam';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveEntityData implements IamActiveEntityData {
  sub: string;
  name: string;
  authorization_details: string[];
}
