import { Test, TestingModule } from '@nestjs/testing';
import { AudioUploadService } from './audio-upload.service';
import { SpeechService } from '../speech/speech.service';
import { TranscripcionService } from '../transcripcion/transcripcion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AudioSubido } from './audio-upload.entity';
import { HistorialProcesamiento } from '../historial/historial.entity'; 

describe('AudioUploadService', () => {
  let service: AudioUploadService;

  const mockSpeechService = {
    transcribirAudio: jest.fn().mockResolvedValue({
      texto: 'Texto simulado',
      palabrasConTimestamps: [],
      cantidadHablantes: 1,
    }),
  };

  const mockTranscripcionService = {
  crearDesdeSpeech: jest.fn().mockResolvedValue(undefined),
  registrarEvento: jest.fn().mockResolvedValue(undefined), // <- AÑADIDO
  };


  const mockAudioRepo = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  };

  const mockHistorialRepo = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioUploadService,
        { provide: SpeechService, useValue: mockSpeechService },
        { provide: TranscripcionService, useValue: mockTranscripcionService },
        { provide: getRepositoryToken(AudioSubido), useValue: mockAudioRepo },
        { provide: getRepositoryToken(HistorialProcesamiento), useValue: mockHistorialRepo },
      ],
    }).compile();

    service = module.get<AudioUploadService>(AudioUploadService);
  });

  it('should upload and transcribe an audio', async () => {
    const mockFile = {
      originalname: 'test.wav',
      mimetype: 'audio/wav',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const mockUser = { id: 'mock-user-id' } as any;

    const result = await service.uploadAudio(mockFile, mockUser);

    expect(result.transcripcion).toBe('Texto simulado');
    expect(result.url).toContain('https://storage.googleapis.com/');
  });
});