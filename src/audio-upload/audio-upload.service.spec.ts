import { Test, TestingModule } from '@nestjs/testing';
import { AudioUploadService } from './audio-upload.service';

describe('AudioUploadService', () => {
  let service: AudioUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioUploadService],
    }).compile();

    service = module.get<AudioUploadService>(AudioUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
