import { ApiResponseDto, ApiResponseError } from '../dto/apiResponse.dto';

export function createSuccessResponse<T>(data: T): ApiResponseDto<T> {
  return {
    status: 200,
    data,
    error: null,
  };
}

export function createErrorResponse<T>(
  code: number,
  message: string,
  cause: string[] = [],
): ApiResponseDto<T> {
  const error: ApiResponseError = {
    code,
    message,
    cause,
  };
  return {
    status: code,
    data: null,
    error,
  };
}
