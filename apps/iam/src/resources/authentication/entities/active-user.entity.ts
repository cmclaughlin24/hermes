import { ActiveEntityData as IamActiveEntityData } from '@hermes/iam';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveUserData implements IamActiveEntityData {
  @Field({
    description:
      'Subject identifier (ID) associated with the subject (user) the ' +
      'token is issued to.',
  })
  sub: string;

  @Field({
    description: 'Name of the subject (user).',
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
      'A unique identifer assigned to the token. Checked during verification ' +
      'to prevent more than one token from being issued to the subject.',
  })
  jti: string;
}
