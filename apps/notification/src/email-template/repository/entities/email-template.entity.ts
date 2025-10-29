import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EmailTemplateEntity {
  @AutoMap()
  @PrimaryColumn()
  name: string;

  @AutoMap()
  @Column()
  subject: string;

  @AutoMap()
  @Column({ length: 2000 })
  template: string;

  @AutoMap()
  @Column({ type: 'simple-json', nullable: true })
  context: { [key: string]: any };

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date;
}
