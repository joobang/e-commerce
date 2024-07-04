import { User } from '@prisma/client';

export interface UserCreateDto {
  name: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  profileImage?: string | null;
  phoneNumber?: string;
  birthDate?: Date;
  signupDate?: Date;
}

export interface UserInfoDto {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  birthDate?: Date | null;
  signupDate: Date;
  profileImage?: string | null;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export function toUserInfo(user: User): UserInfoDto {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    signupDate: user.signupDate,
  };
}

