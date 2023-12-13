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
  @Field(() => ID)
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  @HideField()
  password: string;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [DeliveryMethods], { nullable: true })
  deliveryMethods?: DeliveryMethods[];

  @Column({ default: 'Etc/UTC' })
  timeZone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DeliveryWindow, (window) => window.user, { cascade: true })
  deliveryWindows?: DeliveryWindow[];

  @JoinTable()
  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions?: Permission[];
}
