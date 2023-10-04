import { ApolloServerErrorCode } from '@apollo/server/errors';
import { errorToGraphQLException } from '@hermes/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('userId') id: string) {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new GraphQLError(`User userId=${id} not found!`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return user;
  }

  @Mutation(() => User, { name: 'createUser' })
  async create(@Args('createUserInput') createUserInput: CreateUserInput) {
    try {
      const user = await this.userService.create(createUserInput);

      return user;
    } catch (error) {
      throw errorToGraphQLException(error);
    }
  }

  @Mutation(() => User, { name: 'updateUser' })
  async update(
    @Args('userId') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    try {
      const user = await this.userService.update(id, updateUserInput);

      return user;
    } catch (error) {
      throw errorToGraphQLException(error);
    }
  }

  @Mutation(() => User, { name: 'removeUser' })
  async delete(@Args('userId') id: string) {
    try {
      const user = await this.userService.delete(id);

      return user;
    } catch (error) {
      throw errorToGraphQLException(error);
    }
  }
}