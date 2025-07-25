import { Transcripcion } from "src/transcripcion/transcripcion.entity";
import { User } from "src/users/user.entity";
import { HistorialProcesamiento } from "src/historial/historial.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class AudioSubido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => User, { nullable: false })
  usuario: User;

  @OneToMany(() => Transcripcion, transcripcion => transcripcion.audio)
  transcripciones: Transcripcion[];

  @OneToMany(() => HistorialProcesamiento, historial => historial.audio, { cascade: true })
  historial: HistorialProcesamiento[];
}