import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { DeliveryMethods } from '../enums/delivery-methods.enum';
import { DeliveryWindow } from './delivery-window.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {
    description: 'A universal unique identifier (UUID) for the user.',
  })
  id: string;

  @Column()
  @Field({
    description: 'Name of the user.',
  })
  name: string;

  @Column({ unique: true })
  @Field({
    description:
      'Email address of the user. An email address is unique within ' +
      'the system and cannot be assigned to multiple user.',
  })
  email: string;

  @Column({ unique: true })
  @Field({
    description:
      'Phone number of the user. A phone number is unique within ' +
      'the system and cannot be assigned to multiple users.',
  })
  phoneNumber: string;

  @Column()
  @HideField()
  password: string;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [DeliveryMethods], {
    nullable: true,
    description:
      "An array of the user's preferred notification delivery methods.",
  })
  deliveryMethods?: DeliveryMethods[];

  @Column({ default: 'Etc/UTC' })
  @Field({
    description:
      "User's preferred IANA time zone. Used to format notification date/timestamps " +
      "and send notifications within the user's delivery windows.",
  })
  timeZone: string;

  @CreateDateColumn()
  @HideField()
  createdAt: Date;

  @UpdateDateColumn()
  @HideField()
  updatedAt: Date;

  @OneToMany(() => DeliveryWindow, (window) => window.user, { cascade: true })
  deliveryWindows?: DeliveryWindow[];

  @JoinTable()
  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions?: Permission[];
}
