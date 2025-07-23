import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { SpeechService } from '../transcripcion/speech.service';
import { TranscripcionService } from '../transcripcion/transcripcion.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioSubido } from './audio-upload.entity';
import { User } from '../users/user.entity';
import { HistorialProcesamiento } from '../historial/historial.entity';

@Injectable()
export class AudioUploadService {
  private storage = new Storage({
    keyFilename: path.join(__dirname, '../../google-credentials.json'),
  });

  private bucketName = 'sonidoclaro-audios';

  constructor(
    private speechService: SpeechService,
    private transcripcionService: TranscripcionService,
    @InjectRepository(AudioSubido)
    private audioRepo: Repository<AudioSubido>,
    @InjectRepository(HistorialProcesamiento)
    private historialRepo: Repository<HistorialProcesamiento>,
  ) {}

  async uploadAudio(
    file: Express.Multer.File,
    usuario: User,
  ): Promise<{ url: string; transcripcion: string }> {
    const uniqueFileName = `${uuid()}_${file.originalname}`;
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(uniqueFileName);

    await blob.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      resumable: false,
    });

    const gcsUri = `gs://${this.bucketName}/${uniqueFileName}`;
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${uniqueFileName}`;

    const audioGuardado = await this.audioRepo.save(
      this.audioRepo.create({
        id: uuid(),
        url: publicUrl,
        usuario: usuario,
      }),
    );

    await this.transcripcionService.registrarEvento(
      audioGuardado,
      'SUBIDA',
      'Audio subido con éxito',
    );

    try {
      const resultado = await this.speechService.transcribirAudio(gcsUri);

      await this.transcripcionService.crearDesdeSpeech(
        resultado.texto,
        resultado.palabrasConTimestamps,
        resultado.cantidadHablantes,
        audioGuardado,
      );

      await this.transcripcionService.registrarEvento(
        audioGuardado,
        'TRANSCRIPCION',
        'Transcripción completada correctamente',
      );

      return {
        url: publicUrl,
        transcripcion: resultado.texto,
      };
    } catch (error) {
      await this.transcripcionService.registrarEvento(
        audioGuardado,
        'ERROR',
        `Error en transcripción: ${error.message}`,
      );
      throw error;
    }
  }
}