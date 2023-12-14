import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Tokens {
  @Field({
    description: 'Token used for authentication and authorization.',
  })
  accessToken: string;

  @Field({
    description:
      'Token used to obtain a new access token. Invalidated after it has been ' +
      'redeemed (replay attack) or if an attempt to redeem a previously used token ' +
      'is made (revoke token family).',
  })
  refreshToken: string;
}
