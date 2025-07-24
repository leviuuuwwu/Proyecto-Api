import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { SpeechService } from '../speech/speech.service';
import { TranscripcionService } from '../transcripcion/transcripcion.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioSubido } from './audio-upload.entity';
import { User } from '../users/user.entity';
import { HistorialService } from '../historial/historial.service';

@Injectable()
export class AudioUploadService {
  private storage = new Storage({
    keyFilename: path.resolve(
      process.cwd(),
      process.env.GOOGLE_APPLICATION_CREDENTIALS ?? (() => { throw new Error('GOOGLE_APPLICATION_CREDENTIALS env variable is not set'); })()
    ),
  });

  private bucketName = 'sonidoclaro-audios';

  constructor(
    private speechService: SpeechService,
    private transcripcionService: TranscripcionService,
    private readonly historialService: HistorialService,
    @InjectRepository(AudioSubido)
    private audioRepo: Repository<AudioSubido>,
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
        usuario,
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
        resultado.palabrasConTimestamps as any[],
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
      console.error('❌ Error al transcribir:', error);
      await this.transcripcionService.registrarEvento(
        audioGuardado,
        'ERROR',
        `Error en transcripción: ${error.message}`,
      );
      throw error;
    }
  }
}
