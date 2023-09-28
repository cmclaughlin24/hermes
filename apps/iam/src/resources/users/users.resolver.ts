import { ApolloServerErrorCode } from '@apollo/server/errors';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CreateUserInput } from './dto/create-user.input';
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
  async findOne(@Args('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new GraphQLError(`User ${id} not found!`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return user;
  }

  @Mutation(() => User, { name: 'signUp' })
  async create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }
}
