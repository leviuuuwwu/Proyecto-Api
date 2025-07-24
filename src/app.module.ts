import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AudioUploadModule } from './audio-upload/audio-upload.module';
import { AudioSubido } from './audio-upload/audio-upload.entity';
import { PalabraClaveDetectada } from './audio-analisis/palabra-clave.entity';
import { HistorialProcesamiento } from './historial/historial.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UsersModule,
    AuthModule,
    PalabraClaveDetectada,
    HistorialProcesamiento,
    AudioUploadModule,
    AudioSubido,
  ],
})
export class AppModule {}
