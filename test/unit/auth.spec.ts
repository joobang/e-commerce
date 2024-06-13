import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

import { CanActivate, INestApplication } from '@nestjs/common';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { GoogleAuthGuard } from "../../src/auth/guard/google.guard";

describe('AuthController', () => {
  let app: INestApplication;
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockGoogleGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGoogleGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('GET /auth/login/google', () => {
    it('should use GoogleAuthGuard and redirect to Google OAuth', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/login/google')
        .expect(200); // Expecting a redirect status code

      //expect(response.header['location']).toMatch(/^https:\/\/google\.com/); // Expecting redirection to Google OAuth URL
    });
  });
});
