import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication; // Nest 애플리케이션 인스턴스
  let prisma: PrismaService;

  // 테스트 모듈 설정 및 Nest 애플리케이션 초기화
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Nest 애플리케이션 인스턴스를 생성
    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    // 애플리케이션을 초기화
    await app.init();
  });

  // "oauth2/redirect/google" 엔드포인트 테스트
  describe('oauth2/redirect/google : googleAuthRedirect', () => {
    it('구글 로그인 설정 리다이렉트 주소로 이동', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/oauth2/redirect/google')
        .expect(302);
      // response 헤더의 location이 Google 로그인 페이지로 리다이렉션되는지 확인
      expect(response.headers.location).toContain('accounts.google.com');
    });
    it('DB 유저 생성 확인', async () => {
      // 데이터베이스에서 사용자 확인
      const user = await prisma.user.findUnique({
        where: { email: 'ehwnghks@gmail.com' },
      });

      expect(user).not.toBeNull();
      if (user) {
        expect(user.email).toEqual('ehwnghks@gmail.com');
      }
    });
  });

  // 테스트가 모두 종료된 후 애플리케이션 닫기
  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });
});
