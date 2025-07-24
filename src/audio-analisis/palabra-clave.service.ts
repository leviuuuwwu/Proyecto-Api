import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PalabraClaveDetectada } from './palabra-clave.entity';
import { Transcripcion } from '../transcripcion/transcripcion.entity';

@Injectable()
export class PalabraClaveService {
  private readonly palabrasClave = ['easy', 'days', 'chicken'];

  constructor(
    @InjectRepository(PalabraClaveDetectada)
    private readonly palabraRepo: Repository<PalabraClaveDetectada>,
  ) {}

  async detectar(palabrasConTimestamps: any[], transcripcion: Transcripcion): Promise<void> {
    if (!Array.isArray(palabrasConTimestamps)) return;

    const detectadas = palabrasConTimestamps
      .filter((p) => p?.palabra && this.palabrasClave.includes(p.palabra.toLowerCase()))
      .map((p) =>
        this.palabraRepo.create({
          palabra: p.palabra,
          timestamp: parseFloat(p.inicio), // asegúrate que sea número
          transcripcion,
        }),
      );

    await this.palabraRepo.save(detectadas);
  }
}
