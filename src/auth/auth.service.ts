import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { GoogleRequest } from './dto/google.user';
import * as process from 'process';

@Injectable()
export class AuthService {
  private readonly looger: Logger = new Logger(AuthService.name);
  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email },
      } = req;
      //const findUser = await this.userRepository.findOneGetByEmail(email);
      // if (!findUser) {
      //   return null;
      // }

      const googlePayload = { email, sub: 'test' };

      const googleJwt = {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expireIn: process.env.JWT_EXPIRES,
        }),
      };
      return googleJwt;
    } catch (error) {
      this.looger.error(error);
      throw new UnauthorizedException('로그인 실패');
    }
  }
}
