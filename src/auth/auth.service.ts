import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  async signUp(data: UserDto): Promise<User> {
    this.logger.log(`create User : ${data.name}(${data.email})`);
    return this.prisma.user.create({ data });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`find by email : ${email}`);
    return this.prisma.user.findUnique({ where: { email } });
  }
}
