import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['queue', 'messageType'],
    },
  ],
})
export class DistributionEvent extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  queue: string;

  @Column
  messageType: string;

  @Column(DataType.ARRAY(DataType.STRING))
  metadataLabels: string[];
}
