import { AuthController } from '../../src/auth/auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '../../src/auth/guard/google.guard';
import * as request from 'supertest';
import { GoogleStrategy } from '../../src/auth/strategy/google.strategy';
import { GoogleRequest } from '../../src/auth/dto/google.user';
import { Response } from 'express';
import { INestApplication } from '@nestjs/common';
import { UserDto } from "../../src/user/dto/user.dto";

// Google 사용자 인터페이스 정의
interface GoogleUser {
  email: string;
  username: string;
  photo: string;
}

// 테스트를 위한 GoogleRequest 모킹 타입 정의
interface MockGoogleRequest extends Partial<Request> {
  user: GoogleUser;
}

// 테스트를 위한 Response 모킹 타입 정의
interface MockResponse extends Partial<Response> {
  redirect: jest.Mock;
}

describe('AuthController (unit)', () => {
  let app: INestApplication; // Nest 애플리케이션 인스턴스
  let authController: AuthController; // AuthController 인스턴스
  let authService: AuthService; // AuthService 인스턴스
  let jwtService: JwtService; // JwtService 인스턴스
  let configService: ConfigService; // ConfigService 인스턴스

  // 모킹된 요청 객체
  const mockReq: MockGoogleRequest = {
    user: {
      email: 'test@example.com',
      username: 'Test User',
      photo: 'https://test.com/photo.jpg',
    },
  };

  // 모킹된 응답 객체
  const mockRes: MockResponse = {
    redirect: jest.fn(),
  };

  // 모킹된 사용자 데이터
  const user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    profile_image: 'https://test.com/photo.jpg',
    password: 'hashedpassword',
    user_desc: null,
  };

  // 로그인 모킹 객체
  const loginUser: Partial<UserDto> = {
    email: 'test@example.com',
  };

  // 테스트 모듈 설정 및 Nest 애플리케이션 초기화
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
      ],
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

    // 테스트를 위해 인스턴스를 가져온다.
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Nest 애플리케이션 인스턴스를 생성
    app = module.createNestApplication();
    // 애플리케이션을 초기화
    await app.init();
  });

  // "login/google" 엔드포인트 테스트
  describe('GET /auth/login/google : googleAuth', () => {
    it('구글 로그인 설정 리다이렉트 주소로 이동', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/login/google')
        .expect(302);

      // response 헤더의 location이 Google 로그인 페이지로 리다이렉션되는지 확인
      expect(response.headers.location).toContain('accounts.google.com');
    });
  });

  // "oauth2/redirect/google" 엔드포인트 테스트
  describe('GET /auth/oauth2/redirect/google : googleAuthRedirect', () => {
    // 각 테스트 케이스 실행 전에 수행할 설정
    beforeEach(async () => {
      // AuthService 메서드들을 모킹하여 반환값 설정
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(null);
      jest.spyOn(authService, 'signUp').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
      jest.spyOn(configService, 'get').mockReturnValue('https://example.com');

      // 테스트할 컨트롤러 메서드 호출
      await authController.googleAuthRedirect(
        mockReq as GoogleRequest,
        mockRes as Response,
      );
    });

    // getUserByEmail 메서드 호출 확인
    it('should call getAdminUser with correct email', () => {
      expect(authService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    // signUp 메서드 호출 확인
    it('should call signUp with correct user data if user does not exist', () => {
      expect(authService.signUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        profile_image: 'https://test.com/photo.jpg',
        password: '1234',
      });
    });

    // jwtService.sign 메서드 호출 확인
    it('should call jwtService.sign with correct user data', () => {
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    // res.redirect 메서드 호출 확인
    it('should call res.redirect with correct URL', () => {
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'https://google.com?token=token',
      );
    });
  });

  describe('POST auth/login : login', () => {
    it('로그인 (user.email) 실패', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(null);
      const response = await authController.login(loginUser as UserDto);
      expect(authService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(response.data).toBeNull();
    });

    it('로그인 (user.email) 성공', async () => {
      // user 데이어 모킹
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(user);
      const response = await authController.login(loginUser as UserDto);
      expect(authService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(response.data).toEqual(user);
    });
  });

  // 테스트가 모두 종료된 후 애플리케이션 닫기
  afterAll(async () => {
    await app.close();
  });
});
describe('AuthService (unit)', () => {
  let authService: AuthService; // AuthService 인스턴스
  let prismaService: PrismaService; // PrismaService 인스턴스

  // 모킹된 사용자 데이터
  const user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    profile_image: 'https://test.com/photo.jpg',
    password: 'hashedpassword',
    user_desc: null,
  };

  // 모킹된 UserDto 데이터
  const userDto = {
    name: 'Test User',
    email: 'test@example.com',
    profile_image: 'https://test.com/photo.jpg',
    password: 'hashedpassword',
    user_desc: null,
  };
  // 테스트 모듈 설정 및 Nest 애플리케이션 초기화
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockReturnValue(user),
              findUnique: jest.fn().mockReturnValue(user),
            },
          },
        },
      ],
    }).compile();

    // 테스트를 위해 인스턴스를 가져온다.
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('signUp()', () => {
    it('should create a new user', async () => {
      const result = await authService.signUp(userDto);
      expect(result).toEqual(user);
      expect(prismaService.user.create).toHaveBeenCalledWith({ data: userDto });
    });
  });

  describe('getUserByEmail()', () => {
    it('should return a user by email', async () => {
      const result = await authService.getUserByEmail(user.email);
      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      const result = await authService.getUserByEmail(
        'nonexistent@example.com',
      );
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });
});
