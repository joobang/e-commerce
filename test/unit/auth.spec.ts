import { AuthController } from '../../src/auth/auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '../../src/auth/guard/google.guard';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GoogleStrategy } from '../../src/auth/strategy/google.strategy';
import * as passport from 'passport';
import { NextFunction } from 'express';

describe('AuthController (unit)', () => {
  let app: INestApplication;
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        JwtService,
        ConfigService,
        GoogleStrategy,
        GoogleAuthGuard,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('login/google : googleAuth', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/login/google')
      .expect(302);

    // response 헤더의 location이 Google 로그인 페이지로 리다이렉션되는지 확인
    expect(response.headers.location).toContain('accounts.google.com');
  });

  afterAll(async () => {
    await app.close();
  });
});
