import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import * as _ from 'lodash';
import { Permission } from '../../permission/repository///entities/permission.entity';
import { UserService } from '../user.service';

@Injectable({ scope: Scope.REQUEST })
export class UserPermissionLoader extends DataLoader<string, Permission[]> {
  constructor(private readonly userService: UserService) {
    super((keys) => this.batchLoadFn(keys));
  }

  readonly batchLoadFn = async (ids: readonly string[]) => {
    const userWithPermissions = await this.userService.findPermissions(
      ids as string[],
    );

    // Note: TypeORM does not appear to gurantee response matches `In` clause order so
    //       this is handled programatically to ensure correct order.
    return _.chain(userWithPermissions)
      .sortBy((user) => ids.indexOf(user.id))
      .map((user) => user.permissions)
      .value();
  };
}
