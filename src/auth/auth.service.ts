import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  toUserInfo,
  UserCreateDto,
  UserInfoDto,
  UserLoginDto,
} from '../user/dto/user.dto';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async signUp(data: UserCreateDto): Promise<UserInfoDto> {
    this.logger.log(`create User : ${data.name}(${data.email})`);
    if (data.password != null) {
      data.password = await this.cryptoService.generateHash(data.password);
    }
    const result = await this.prisma.user.create({ data });
    return toUserInfo(result);
  }

  async googleSignUp(data: UserCreateDto): Promise<UserInfoDto> {
    this.logger.log(`create User : ${data.name}(${data.email})`);
    const result = await this.prisma.user.create({ data });
    return toUserInfo(result);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`find by email : ${email}`);
    return this.prisma.user.findUnique({ where: { email } });
  }

  async login(loginDto: UserLoginDto): Promise<UserInfoDto | null> {
    this.logger.log(`login ! : ${loginDto.email}`);
    const user = await this.getUserByEmail(loginDto.email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.validateHash(
      loginDto.password,
      user.password || '',
    );

    return isPasswordValid ? toUserInfo(user) : null;
  }
}
