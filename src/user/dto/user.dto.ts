import { User } from '@prisma/client';

export interface UserCreateDto {
  name: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  profile_image?: string | null;
}

export interface UserInfoDto {
  id: number;
  name: string;
  email: string;
  profile_image?: string | null;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  password?: string;
  profile_image?: string | null;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export function toUserInfo(user: User): UserInfoDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile_image: user.profile_image,
  };
}
