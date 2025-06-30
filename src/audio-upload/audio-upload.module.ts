import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioUploadController } from './audio-upload.controller';
import { AudioUploadService } from './audio-upload.service';
import { AudioSubido } from './audio-upload.entity';
import { SpeechService } from '../transcripcion/speech.service';
import { TranscripcionModule } from '../transcripcion/transcripcion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioSubido]),
    TranscripcionModule, 
  ],
  providers: [AudioUploadService, SpeechService],
})

export class AudioUploadModule {}