import { ActiveEntityData as IamActiveEntityData } from '@hermes/iam';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveKeyData implements IamActiveEntityData {
  @Field({
    description:
      'Subject identifier (ID) associated with the subject (api key) the ' +
      'token is issued to.',
  })
  sub: string;

  @Field({
    description: 'Name of the subject (api key).',
  })
  name: string;

  @Field({
    description:
      'An array of strings representing the permissions of the access token. ' +
      'Each permission contains data to specify the allowed actions for a resource. ' +
      '(example: VideoGame=Play)',
  })
  authorization_details: string[];

  @Field({
    description:
      'The expiration time on or after which the api key will be considered ' +
      'invalid. Default expiration is 1 year after token was generated.',
  })
  exp: number;
}
