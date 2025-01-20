import { ApolloServerErrorCode } from '@apollo/server/errors';
import { errorToGraphQLException } from '@hermes/common';
import { IamPermission } from '@hermes/iam';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './repository/entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  private static readonly RESOURCE_IDENTIFIER = 'user';

  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  @IamPermission({
    resource: UserResolver.RESOURCE_IDENTIFIER,
    action: 'list',
  })
  async findAll(
    @Args('userIds', { type: () => [String], nullable: true })
    ids: string[],
  ) {
    return this.userService.findAll(ids);
  }

  @Query(() => User, { name: 'user' })
  @IamPermission({
    resource: UserResolver.RESOURCE_IDENTIFIER,
    action: 'get',
  })
  async findOne(@Args('userId', { type: () => ID }) id: string) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new GraphQLError(`User userId=${id} not found!`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return user;
  }

  @Mutation(() => User, { name: 'createUser' })
  @IamPermission({
    resource: UserResolver.RESOURCE_IDENTIFIER,
    action: 'create',
  })
  async create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => User, { name: 'updateUser' })
  @IamPermission({
    resource: UserResolver.RESOURCE_IDENTIFIER,
    action: 'update',
  })
  async update(
    @Args('userId', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserInput).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => User, { name: 'removeUser' })
  @IamPermission({
    resource: UserResolver.RESOURCE_IDENTIFIER,
    action: 'remove',
  })
  async delete(@Args('userId', { type: () => ID }) id: string) {
    return this.userService.remove(id).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }
}
