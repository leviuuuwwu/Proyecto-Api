import { Module } from '@nestjs/common';
import { AudioUploadController } from './audio-upload.controller';
import { AudioUploadService } from './audio-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioSubido } from './audio-upload.entity';
import { Transcripcion } from '../transcripcion/transcripcion.entity';
import { TranscripcionModule } from '../transcripcion/transcripcion.module';
import { SpeechModule } from '../speech/speech.module';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioSubido, Transcripcion]),
    TranscripcionModule,
    SpeechModule,
    HistorialModule,
  ],
  controllers: [AudioUploadController],
  providers: [AudioUploadService],
})
export class AudioUploadModule {}