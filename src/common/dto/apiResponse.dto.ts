export interface ApiResponseDto<T> {
  status: number;
  data: T | null;
  error: ApiResponseError | null;
}

export interface ApiResponseError {
  code: number;
  message: string;
  cause?: string[];
}
