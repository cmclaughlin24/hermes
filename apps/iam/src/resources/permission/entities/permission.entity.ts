import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PermissionAction } from '../enums/permission-action.enum';

@Entity()
@Unique(['resource', 'action'])
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  resource: string;

  @Column({
    enumName: 'PermissionAction',
    enum: [
      PermissionAction.LIST,
      PermissionAction.GET,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
      PermissionAction.REMOVE,
    ],
  })
  action: PermissionAction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.permissions)
  users?: User[];
}
