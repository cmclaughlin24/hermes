import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique('start_time', ['dayOfWeek', 'atHour', 'atMinute'])
@ObjectType()
export class DeliveryWindow {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {
    description:
      'A universial unique identifier (UUID) that identifies a unique ' +
      'delivery window. Allows a user to specify multiple delivery windows ' +
      'on the same day of the week.',
  })
  id: string;

  @Column()
  @Field({
    description:
      'An integer, between 0 and 6, representing the day of the week where ' +
      'Sunday is 0 and Saturday is 6.',
  })
  dayOfWeek: number;

  @Column()
  @Field({
    description:
      'An integer, between 0 and 23, representing the hour at which the ' +
      'delivery window starts.',
  })
  atHour: number;

  @Column()
  @Field({
    description:
      'An integer, between 0 and 59, representing the minutes past the hour ' +
      'the delivery window starts.',
  })
  atMinute: number;

  @Column()
  @Field({
    description:
      'An integer, greater than 0, representing the length of the delivery ' +
      'window in minutes.',
  })
  duration: number;

  @ManyToOne(() => User, (user) => user.deliveryWindows, {
    onDelete: 'CASCADE',
  })
  user?: User;
}
