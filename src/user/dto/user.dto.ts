import { User } from "@prisma/client";

export interface UserCreateDto {
  name: string;
  password: string;
  passwordConfirm: string;
  email: string;
  profile_image: string | null;
}

export interface UserInfoDto {
  name: string;
  email: string;
  profile_image: string | null;
}

export interface UserDto {
  name: string;
  password: string;
  email: string;
  profile_image: string | null;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export function toUser(userCreateDto: UserCreateDto): UserDto {
  const { passwordConfirm, ...userDto } = userCreateDto;
  return userDto;
}

export function toUserInfo(user: User): UserInfoDto {
  const { password, ...userInfoDto } = user;
  return userInfoDto;
}
