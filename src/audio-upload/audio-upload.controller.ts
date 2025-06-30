import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioUploadService } from './audio-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';

@ApiTags('Audios')
@ApiBearerAuth()
@Controller('upload-audio')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AudioUploadController {
  constructor(private readonly audioUploadService: AudioUploadService) {}

  @Post()
  @Roles('usuario', 'admin') // Solo usuarios autenticados con rol válido
  @UseInterceptors(FileInterceptor('audio'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAudio(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new HttpException('Archivo no enviado', HttpStatus.BAD_REQUEST);
    }

    const usuario = req.user;
    const resultado = await this.audioUploadService.uploadAudio(file, usuario);

    return {
      mensaje: 'Audio subido y transcrito exitosamente',
      ...resultado,
    };
  }
}