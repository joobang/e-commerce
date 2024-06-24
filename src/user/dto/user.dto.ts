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

export function toUser(userCreateDto: UserCreateDto) {
  const { passwordConfirm, ...userDto } = userCreateDto;
  return userDto;
}