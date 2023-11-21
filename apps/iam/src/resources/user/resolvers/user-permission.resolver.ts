import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Permission } from '../../permission/entities/permission.entity';
import { PermissionService } from '../../permission/permission.service';
import { User } from '../entities/user.entity';

@Resolver(() => User)
export class UserPermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @ResolveField('permissions', () => [Permission])
  async getUserPermissions(@Parent() user: User) {
    // Todo: Implement batching to reduce traffic to the database.
    return this.permissionService.findUserPermissions(user.id);
  }
}
