import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationAttempt } from './notification-attempt.entity';

@Entity()
export class NotificationLog {
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

  @OneToMany(() => NotificationAttempt, (attempt) => attempt.log, {
    cascade: true,
  })
  attemptHistory: NotificationAttempt[];
}

