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
import { UserStatus } from "../user/constant/user.status";

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async signUp(userCreateDto: UserCreateDto): Promise<UserInfoDto> {
    this.logger.log(
      `create User : ${userCreateDto.name}(${userCreateDto.email})`,
    );
    if (userCreateDto.password != null) {
      userCreateDto.password = await this.cryptoService.generateHash(
        userCreateDto.password,
      );
    }
    const { passwordConfirm, ...data } = userCreateDto;
    const result = await this.prisma.user.create({
      data: {
        ...data,
        status: UserStatus.CREATED,
      },
    });
    return toUserInfo(result);
  }

  async googleSignUp(data: UserCreateDto): Promise<UserInfoDto> {
    this.logger.log(`create User : ${data.name}(${data.email})`);
    const result = await this.prisma.user.create({
      data: {
        ...data,
        status: UserStatus.CREATED,
      },
    });
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
