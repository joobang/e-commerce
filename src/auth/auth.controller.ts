import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guard/google.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GoogleRequest } from './dto/google.user';
import { toUser, UserCreateDto, UserInfoDto, UserLoginDto } from "../user/dto/user.dto";
import {
  createErrorResponse,
  createSuccessResponse,
} from '../common/helper/response.helper';
import { ApiResponseDto } from '../common/dto/apiResponse.dto';

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
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    this.logger.log('GET oauth2/redirect/google - googleAuthRedirect 실행');
    // TODO: 구글 로그인 시 바로 user 생성 -> 유저 정보 리턴으로 변경해야함.
    const { user: googleUser } = req;
    // 아이디가 존재하는지 확인
    // 없으면 가입
    // 있으면 로그인
    // accessToken 발급  (jwt)
    const user = await this.authService.getUserByEmail(googleUser.email);
    if (!user) {
      await this.authService.googleSignUp({
        name: googleUser.username,
        email: googleUser.email,
        profile_image: googleUser.photo,
      }); // DB에 저장
    }
    const token = this.jwtService.sign({
      email: googleUser.email,
    }); // 토큰 발급
    this.logger.debug(
      `user : ${JSON.stringify(user)} token: ${JSON.stringify(token)}`,
    );
    return res.redirect(
      this.configService.get('GOOGLE_TARGET_URL') + '?token=' + token,
    );
  }

  @Post('login')
  async login(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<ApiResponseDto<UserInfoDto>> {
    this.logger.log('POST auth/login');
    const user = await this.authService.login(userLoginDto);
    if (user) {
      return createSuccessResponse<UserInfoDto>(user);
    } else {
      return createErrorResponse(400, 'check email Or password');
    }
  }

  @Post('signup')
  async signUp(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<ApiResponseDto<UserInfoDto>> {
    const { password, passwordConfirm } = userCreateDto;
    if (password !== passwordConfirm) {
      return createErrorResponse(400, 'password & passwordConfirm check');
    }
    const checkUser = await this.authService.getUserByEmail(
      userCreateDto.email,
    );
    if (checkUser) {
      return createErrorResponse(400, 'user already exist');
    }

    const user = await this.authService.signUp(userCreateDto);
    return createSuccessResponse<UserInfoDto>(user);
  }

  @Get('check-email')
  async checkEmail(
    @Req() req: Request,
    @Query('email') email: string,
  ): Promise<ApiResponseDto<boolean>> {
    if (!email) {
      return createErrorResponse(400, 'email is empty');
    }
    const user = await this.authService.getUserByEmail(email);
    return createSuccessResponse<boolean>(!!user);
  }
}
