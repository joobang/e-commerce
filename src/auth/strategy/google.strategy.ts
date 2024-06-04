import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/oauth2/redirect/google', // 이 부분은 구글 콘솔에서 설정한대로. 승인된 리디렉션 URI
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { name, emails, photos } = profile;
      console.log('🚀 🔶 GoogleStrategy 🔶 validate 🔶 profile:', profile);
      const user = {
        email: emails[0].value,
        //firstName: name.familyName,
        //lastName: name.givenName,
        username: name.familyName + name.givenName,
        photo: photos[0].value,
      };
      console.log('🚀 🔶 GoogleStrategy 🔶 validate 🔶 user:', user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
