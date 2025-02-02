import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PushTemplate } from './push-template.entity';

@Entity()
export class PushAction {
  @PrimaryColumn()
  action: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => PushTemplate, (template) => template.actions, {
    onDelete: 'CASCADE',
  })
  template: PushTemplate;
}


