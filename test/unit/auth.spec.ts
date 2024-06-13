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

describe('AuthController (unit)', () => {
  let app: INestApplication;
  let authController: AuthController;
  let googleAuthGuard: GoogleAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        JwtService,
        ConfigService,
        GoogleStrategy,
        {
          provide: GoogleAuthGuard,
          useValue: {
            canActivate: jest.fn((context: ExecutionContext) => {
              return true;
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    googleAuthGuard = module.get<GoogleAuthGuard>(GoogleAuthGuard);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('login/google : googleAuth', async () => {
    const canActivateSpy = jest.spyOn(googleAuthGuard, 'canActivate');

    //await authController.googleAuth();

    const response = await request(app.getHttpServer())
      .get('/auth/login/google')
      .expect(302);

    expect(canActivateSpy).toHaveBeenCalled();
    //expect(response.headers.location).toBe('/oauth2/redirect/google');
  });

  afterAll(async () => {
    await app.close();
  });
});
