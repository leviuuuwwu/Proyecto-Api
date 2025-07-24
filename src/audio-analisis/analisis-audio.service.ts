import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalisisAudio } from './analisis-audio.entity';
import { AudioSubido } from 'src/audio-upload/audio-upload.entity';

@Injectable()
export class AnalisisAudioService {
  constructor(
    @InjectRepository(AnalisisAudio)
    private readonly repo: Repository<AnalisisAudio>,
  ) {}

  async analizar(audio: AudioSubido, buffer: Buffer) {
    const metrica = {
      duracionSegundos: buffer.length / 16000, // simulado
      volumenPromedio: 0.8,
      silencios: 2,
    };

    const analisis = this.repo.create({ audio, metrica });
    return this.repo.save(analisis);
  }
}