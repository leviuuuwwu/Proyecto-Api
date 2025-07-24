import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { AudioSubido } from '../audio-upload/audio-upload.entity';
import { PalabraClaveDetectada } from '../audio-analisis/palabra-clave.entity';

@Entity()
export class Transcripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  texto: string;

  @OneToMany(() => PalabraClaveDetectada, palabra => palabra.transcripcion, { cascade: true })
  palabrasClave: PalabraClaveDetectada[];

  @Column('jsonb', { nullable: true })
  palabrasConTimestamps: any; // lista de palabras con start/end

  @Column({ nullable: true })
  cantidadHablantes: number;

  @ManyToOne(() => AudioSubido, audio => audio.transcripciones, { onDelete: 'CASCADE' })
  audio: AudioSubido;

  @CreateDateColumn()
  creadoEn: Date;
}