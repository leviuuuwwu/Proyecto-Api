import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioUploadService } from './audio-upload.service';

@Controller('upload-audio')
export class AudioUploadController {
  constructor(private readonly audioUploadService: AudioUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const url = await this.audioUploadService.uploadAudio(file);
    return { url };
  }
}