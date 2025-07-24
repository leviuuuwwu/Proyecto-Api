import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Transcripcion } from '../transcripcion/transcripcion.entity';

@Entity()
export class PalabraClaveDetectada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  palabra: string;

  @Column('float')
  timestamp: number;

  @ManyToOne(() => Transcripcion, transcripcion => transcripcion.palabrasClave, { onDelete: 'CASCADE' })
  transcripcion: Transcripcion;
}