import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { DeliveryWindow } from '../entities/delivery-window.entity';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';

@Resolver(() => User)
export class UserDeliveryWindowResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField('deliveryWindows', () => [DeliveryWindow], {
    description:
      "An array of the user's preferred notification delivery windows. Used w/timeZone to " +
      "calculate if the notification event is within the window's time range.",
  })
  async getUserDeliveryWindows(@Parent() user: User) {
    // Todo: Implement batching to reduce traffic to the database.
    return this.userService.findUserDeliveryWindows(user.id);
  }
}
