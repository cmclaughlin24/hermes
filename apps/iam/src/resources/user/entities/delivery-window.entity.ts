import { ObjectType } from '@nestjs/graphql';
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
  id: string;

  @Column()
  dayOfWeek: number;

  @Column()
  atHour: number;

  @Column()
  atMinute: number;

  @Column()
  duration: number;

  @ManyToOne(() => User, (user) => user.deliveryWindows, {
    onDelete: 'CASCADE',
  })
  user?: User;
}
