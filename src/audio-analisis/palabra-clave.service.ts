import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PalabraClaveDetectada } from './palabra-clave.entity';
import { Transcripcion } from '../transcripcion/transcripcion.entity';
import { In } from 'typeorm';

@Injectable()
export class PalabraClaveService {
  private readonly palabrasPorDefecto = ['easy', 'days', 'chicken'];

  constructor(
    @InjectRepository(PalabraClaveDetectada)
    private readonly palabraRepo: Repository<PalabraClaveDetectada>,
  ) {}

  async detectar(
    palabrasConTimestamps: {
      palabra: string;
      inicio: number;
    }[],
    transcripcion: Transcripcion,
    palabrasClave: string[] = [],
  ) {
    const claves = (palabrasClave.length > 0 ? palabrasClave : this.palabrasPorDefecto)
      .map(c => c.toLowerCase());

    const detectadas = palabrasConTimestamps.flatMap((bloque) => {
      return claves
        .filter(clave => bloque.palabra.toLowerCase().includes(clave))
        .map(clave =>
          this.palabraRepo.create({
            palabra: clave,
            timestamp: bloque.inicio,
            transcripcion,
          }),
        );
    });

    if (detectadas.length > 0) {
      await this.palabraRepo.save(detectadas);
    }
  }

  async detectarDesdePalabras(
    palabras: {
      word: string;
      startTime?: { seconds?: number; nanos?: number };
    }[],
    transcripcion: Transcripcion,
    palabrasClave: string[],
  ) {
    const claves = palabrasClave.map(p => p.toLowerCase());

    const detectadas = palabras
      .filter(p => !!p.word && claves.includes(p.word.toLowerCase()))
      .map(p => ({
        palabra: p.word!,
        timestamp: this.convertirTimestamp(p.startTime),
      }));

    const existentes = await this.palabraRepo.find({
      where: {
        transcripcion: { id: transcripcion.id },
        palabra: In(detectadas.map(d => d.palabra)),
      },
    });

    const nuevas = detectadas.filter(d => {
      return !existentes.some(e =>
        e.palabra === d.palabra &&
        Math.abs(e.timestamp - d.timestamp) < 0.5
      );
    });

    if (nuevas.length > 0) {
      const entidades = nuevas.map(n => this.palabraRepo.create({
        palabra: n.palabra,
        timestamp: n.timestamp,
        transcripcion,
      }));
      await this.palabraRepo.save(entidades);
    }
  }
  private convertirTimestamp(time: { seconds?: number; nanos?: number } | undefined): number {
    const seconds = Number(time?.seconds ?? 0);
    const nanos = Number(time?.nanos ?? 0);
    return seconds + nanos / 1e9;
  }
}