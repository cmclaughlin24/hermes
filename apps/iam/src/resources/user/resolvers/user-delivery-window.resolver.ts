import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserDeliveryWindowLoader } from '../data-loaders/user-delivery-window.loader';
import { DeliveryWindow } from '../repository/entities/delivery-window.entity';
import { User } from '../repository/entities/user.entity';

@Resolver(() => User)
export class UserDeliveryWindowResolver {
  constructor(
    private readonly deliveryWindowLoader: UserDeliveryWindowLoader,
  ) {}

  @ResolveField('deliveryWindows', () => [DeliveryWindow], {
    description:
      "An array of the user's preferred notification delivery windows. Used w/timeZone to " +
      "calculate if the notification event is within the window's time range.",
  })
  async getUserDeliveryWindows(@Parent() user: User) {
    // Note: When executing field resolvers, Graphql will execute it for each user (n) in addition
    //       to the original call (n + 1). A data loader is used to reduce the number of network
    //       trips to the database to 2: 1 to retrieve the list of users, 1 to retrieve a two-dimensional
    ///      list of delivery windows)
    return this.deliveryWindowLoader.load(user.id);
  }
}
