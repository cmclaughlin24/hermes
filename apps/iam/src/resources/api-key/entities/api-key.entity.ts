import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name', 'deletedAt'])
@ObjectType()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {
    description: 'A universal unique identifier (UUID) for the api key.',
  })
  id: string;

  @Column()
  @Field({
    description: 'Common name or label associated with the api key.',
  })
  name: string;

  @Column()
  @HideField()
  apiKey: string;

  @Column()
  @Field({
    description:
      'The expiration time on or after which the api key will be considered ' +
      'invalid. Default expiration is 1 year after token was generated.',
  })
  expiresAt: Date;

  @Column()
  @Field({
    description: 'Identifier of the entity that created the api key.',
  })
  createdBy: string;

  @CreateDateColumn()
  @HideField()
  createdAt: Date;

  @Column({ nullable: true })
  @Field({
    description: 'Identifier of the entity that deleted the api key.',
  })
  deletedBy: string;

  @DeleteDateColumn()
  @HideField()
  deletedAt: Date;
}
