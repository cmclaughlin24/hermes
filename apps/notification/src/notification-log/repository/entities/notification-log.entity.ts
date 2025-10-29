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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  job: string;

  @Column()
  state: string;

  @Column()
  attempts: number;

  @Column('simple-json')
  data: string;

  @Column()
  addedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NotificationAttemptEntity, (attempt) => attempt.log, {
    cascade: true,
  })
  attemptHistory: NotificationAttemptEntity[];
}

