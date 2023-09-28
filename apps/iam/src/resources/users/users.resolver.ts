import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users', })
  async findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }
}
