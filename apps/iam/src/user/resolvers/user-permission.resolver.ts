import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Permission } from '../../permission/repository/entities/permission.entity';
import { UserPermissionLoader } from '../data-loaders/user-permission.loader';
import { UserEntity } from '../repository/entities/user.entity';

@Resolver(() => UserEntity)
export class UserPermissionResolver {
  constructor(private readonly permissionLoader: UserPermissionLoader) {}

  @ResolveField('permissions', () => [Permission], {
    description:
      "An array of the user's permissions that determine whether a request is " +
      'allowed or denied.',
  })
  async getUserPermissions(@Parent() user: UserEntity) {
    return this.permissionLoader.load(user.id);
  }
}
