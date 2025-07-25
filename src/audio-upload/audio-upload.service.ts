import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { PalabraClaveService } from '../audio-analisis/palabra-clave.service';

@Injectable()
export class AudioUploadService {
  private storage = new Storage({
    keyFilename: path.resolve(
      process.cwd(),
      process.env.GOOGLE_APPLICATION_CREDENTIALS ??
        (() => {
          throw new Error(
            'GOOGLE_APPLICATION_CREDENTIALS env variable is not set',
          );
        })(),
    ),
  });

  private bucketName = 'sonidoclaro-audios';

  constructor(
    private speechService: SpeechService,
    private transcripcionService: TranscripcionService,
    private readonly historialService: HistorialService,
    private readonly palabraClaveService: PalabraClaveService,
    @InjectRepository(AudioSubido)
    private audioRepo: Repository<AudioSubido>,
  ) {}

  async uploadAudio(
    file: Express.Multer.File,
    usuario: User,
    palabrasClaveDelCliente?: string[],
  ): Promise<{ url: string; transcripcion: any }> {
    const uniqueFileName = `${uuid()}_${file.originalname}`;
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(uniqueFileName);

    try {
      console.log('🔹 Iniciando subida a GCS:', uniqueFileName);

      await blob.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        resumable: false,
      });

      console.log('✅ Archivo subido a GCS:', uniqueFileName);
    } catch (error) {
      console.error('❌ Error al subir archivo a GCS:', error);
      throw new InternalServerErrorException('Error subiendo archivo a almacenamiento');
    }

    const gcsUri = `gs://${this.bucketName}/${uniqueFileName}`;
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${uniqueFileName}`;

    let audioGuardado: AudioSubido;
    try {
      audioGuardado = await this.audioRepo.save(
        this.audioRepo.create({
          id: uuid(),
          url: publicUrl,
          usuario,
        }),
      );
      console.log('✅ Audio guardado en DB con ID:', audioGuardado.id);
    } catch (error) {
      console.error('❌ Error guardando audio en BD:', error);
      throw new InternalServerErrorException('Error guardando registro de audio');
    }

    await this.transcripcionService.registrarEvento(
      audioGuardado,
      'SUBIDA',
      'Audio subido con éxito',
    );

    try {
      console.log('🔹 Iniciando transcripción para URI:', gcsUri);
      const resultado = await this.speechService.transcribirAudio(gcsUri);

      console.log('✅ Resultado transcripción recibido. Texto:', resultado.texto?.slice(0, 50) + '...');

      // Aquí asumimos que crearDesdeSpeech NO llama a palabraClaveService.detectar internamente.
      const transcripcion = await this.transcripcionService.crearDesdeSpeech(
        resultado.texto,
        resultado.palabrasConTimestamps,
        resultado.cantidadHablantes,
        resultado.segmentosPorHablante,
        audioGuardado,
        palabrasClaveDelCliente,
      );

      console.log('✅ Transcripción creada en BD con ID:', transcripcion.id);

      // Solo aquí llamamos a detectarDesdePalabras para guardar palabras clave, evitando duplicados.
      await this.palabraClaveService.detectarDesdePalabras(
        resultado.palabrasCrudas,
        transcripcion,
        palabrasClaveDelCliente ?? [],
      );

      console.log(
        `✅ Palabras clave detectadas y guardadas. Palabras clave usadas: ${
          palabrasClaveDelCliente ? palabrasClaveDelCliente.length : 0
        }`,
      );

      await this.transcripcionService.registrarEvento(
        audioGuardado,
        'TRANSCRIPCION',
        'Transcripción completada correctamente',
      );

      const transcripcionCompleta = await this.transcripcionService.obtenerPorIdConPalabrasClave(
        transcripcion.id,
      );

      console.log('✅ Transcripción completa con relaciones obtenida.');

      return {
        url: publicUrl,
        transcripcion: transcripcionCompleta,
      };
    } catch (error) {
      console.error('❌ Error al transcribir o guardar datos:', error);
      await this.transcripcionService.registrarEvento(
        audioGuardado,
        'ERROR',
        `Error en transcripción: ${error.message || error}`,
      );
      throw new InternalServerErrorException(error.message || 'Error en transcripción');
    }
  }
}