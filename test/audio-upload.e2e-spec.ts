import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

const audioPath = path.join(__dirname, 'fixtures', 'audioprueba.wav');
if (!fs.existsSync(audioPath)) {
  throw new Error(`Archivo de prueba no encontrado: ${audioPath}`);
}

describe('Audio Upload and Transcription (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/upload-audio (POST) subir y transcribir', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload-audio')
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YmNjM2EyYy00MDIwLTQ2MjctYTFkNC00ZDNhNzYyYTE0YWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTM0NTU1NDksImV4cCI6MTc1MzQ1OTE0OX0.Hu1V1axC5HOHF-DLWw54E3ddpF24kFFvqswUuWHIA6g`)
      .attach('audio', 'test/fixtures/audioprueba.wav');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('transcripcion');
    expect(response.body.transcripcion).toHaveProperty('texto');
    expect(response.body.transcripcion).toHaveProperty('palabrasConTimestamps');
    expect(response.body.transcripcion).toHaveProperty('analisis');
  });

  afterAll(async () => {
    await app.close();
  });
});