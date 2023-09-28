import { ApolloServerErrorCode } from '@apollo/server/errors';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('email') email: string) {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new GraphQLError(`User email=${email} not found!`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return user;
  }
}
