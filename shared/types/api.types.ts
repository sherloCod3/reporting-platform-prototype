export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    [ key: string ]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    hint?: string;
  };
  meta?: {
    timestamp: string;
    [ key: string ]: any;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface Client {
  id: number;
  slug: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
  client: Client;
  expiresIn: string;
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData;
}
