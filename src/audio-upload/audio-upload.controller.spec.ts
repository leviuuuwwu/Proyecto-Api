import { Test, TestingModule } from '@nestjs/testing';
import { AudioUploadController } from './audio-upload.controller';
import { AudioUploadService } from './audio-upload.service';

describe('AudioUploadController', () => {
  let controller: AudioUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioUploadController],
      providers: [
        {
          provide: AudioUploadService,
          useValue: {
            uploadAudio: jest.fn(), // puedes agregar mocks si quieres probar métodos
          },
        },
      ],
    }).compile();

    controller = module.get<AudioUploadController>(AudioUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});