export interface UserCreateDto {
  name: string;
  password: string;
  passwordConfirm: string;
  email: string;
  profile_image: string | null;
}

export interface UserInfoDto {
  name: string;
  password: string;
  email: string;
  profile_image: string | null;
}
