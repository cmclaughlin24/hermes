import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationAttemptEntity } from './notification-attempt.entity';

@Entity()
export class NotificationLogEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column()
  job: string;

  @AutoMap()
  @Column()
  state: string;

  @AutoMap()
  @Column()
  attempts: number;

  @AutoMap()
  @Column('simple-json')
  data: string;

  @AutoMap()
  @Column()
  addedAt: Date;

  @AutoMap()
  @Column({ nullable: true })
  finishedAt: Date;

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date;

  @AutoMap(() => [NotificationAttemptEntity])
  @OneToMany(() => NotificationAttemptEntity, (attempt) => attempt.log, {
    cascade: true,
  })
  attemptHistory: NotificationAttemptEntity[];
}
