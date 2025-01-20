import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import * as _ from 'lodash';
import { DeliveryWindow } from '../repository/entities/delivery-window.entity';
import { UserService } from '../user.service';

@Injectable({ scope: Scope.REQUEST })
export class UserDeliveryWindowLoader extends DataLoader<
  string,
  DeliveryWindow[]
> {
  constructor(private readonly userService: UserService) {
    super(async (keys) => this.batchLoadFn(keys));
  }

  readonly batchLoadFn = async (ids: readonly string[]) => {
    const usersWithDeliveryWindows = await this.userService.findDeliveryWindows(
      ids as string[],
    );

    // Note: TypeORM does not appear to gurantee response matches `In` clause order so
    //       this is handled programatically to ensure correct order.
    return _.chain(usersWithDeliveryWindows)
      .sortBy((user) => ids.indexOf(user.id))
      .map((user) => user.deliveryWindows)
      .value();
  };
}
