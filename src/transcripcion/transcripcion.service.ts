import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcripcion } from './transcripcion.entity';
import { AudioSubido } from '../audio-upload/audio-upload.entity';

@Injectable()
export class TranscripcionService {
  constructor(
    @InjectRepository(Transcripcion)
    private transcripcionRepo: Repository<Transcripcion>,
  ) {}

  async crearDesdeSpeech(
    texto: string,
    palabrasConTimestamps: any,
    cantidadHablantes: number,
    audio: AudioSubido,
  ) {
    const nueva = this.transcripcionRepo.create({
      texto,
      palabrasConTimestamps,
      cantidadHablantes,
      audio,
    });
    return this.transcripcionRepo.save(nueva);
  }
}
