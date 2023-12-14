import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
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

@Entity()
@Unique(['resource', 'action'])
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {
    description:
      'A universal unique identifier (UUID) for the permission. Allows ' +
      'a permission to be attached to one or more users.',
  })
  id: string;

  @Column()
  @Field({
    description: 'The name of the resource associated with the permission.',
  })
  resource: string;

  @Column()
  @Field({
    description: 'Indicates the action that can be performed on the resource.',
  })
  action: string;

  @CreateDateColumn()
  @HideField()
  createdAt: Date;

  @UpdateDateColumn()
  @HideField()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.permissions)
  users?: User[];
}
