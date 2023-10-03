import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  async findAll() {}

  @Query(() => User, { name: 'user' })
  async findOne(@Args('userId') id: string) {}

  @Mutation(() => User, { name: 'createUser' })
  async create(@Args('createUserInput') createUserInput: CreateUserInput) {}

  @Mutation(() => User, { name: 'updateUser' })
  async update(
    @Args('userId') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {}

  @Mutation(() => User, { name: 'removeUser' })
  async delete(@Args('userId') id: string) {}
}
