import { AuthController } from '../../src/auth/auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '../../src/auth/guard/google.guard';
import * as request from 'supertest';
import { GoogleStrategy } from '../../src/auth/strategy/google.strategy';
import { GoogleRequest } from '../../src/auth/dto/google.user';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

describe('AuthController (unit)', () => {
  let app: INestApplication;
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

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
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

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

  it('oauth2/redirect/google : googleAuthRedirect', async () => {
    const mockReq = {
      user: {
        email: 'test@example.com',
        username: 'Test User',
        photo: 'https://test.com/photo.jpg',
      },
    } as Request & GoogleRequest;

    const mockRes = {
      redirect: jest.fn(),
    } as unknown as Response;

    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      profile_image: 'https://test.com/photo.jpg',
      password: 'hashedpassword',
      user_desc: null,
    };

    jest.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(null);
    jest.spyOn(authService, 'signUp').mockResolvedValueOnce(user);
    jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
    jest.spyOn(configService, 'get').mockReturnValue('https://example.com');

    await authController.googleAuthRedirect(mockReq, mockRes);

    expect(authService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(authService.signUp).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      profile_image: 'https://test.com/photo.jpg',
      password: '1234',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(configService.get).toHaveBeenCalledWith('GOOGLE_TARGET_URL');
    expect(mockRes.redirect).toHaveBeenCalledWith(
      'https://example.com?token=token',
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
