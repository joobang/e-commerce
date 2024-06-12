interface GoogleUser {
  email: string;
  username: string;
  photo: string;
}

export type GoogleRequest = Request & { user: GoogleUser };
