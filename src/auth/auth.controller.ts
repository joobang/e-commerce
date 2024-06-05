import { Controller, Get, Logger, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guard/google.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 'google 로그인'버튼 클릭시 호출
  @Get('login/google') // 구글 로그인으로 이동하는 라우터 메서드
  @UseGuards(GoogleAuthGuard) // 여기에서 가드로 가고 googleStrategy에서 validate호출
  async googleAuth(/*@Req() req*/) {
    this.logger.log('GET google/login - googleAuth 실행');
  }

  @Get('oauth2/redirect/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    this.logger.log('GET oauth2/redirect/google - googleAuthRedirect 실행');

    const { user } = req;
    // 아이디가 존재하는지 확인
    // 없으면 가입
    // 있으면 로그인
    // accessToken 발급  (jwt)
    // let adminUser = await this.authService.getAdminUser(user.email);
    // if (adminUser === null) {
    //   adminUser = await this.authService.signUp(user); // DB에 저장
    // }
    // const token = this.jwtService.sign(user); // 토큰 발급
    // this.logger.debug(`token: ${JSON.stringify(token)}`);
    return res.redirect(
      this.configService.get('GOOGLE_TARGET_URL') + '?token=' + 'token',
    );
  }
}
