export interface JwtPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  clientId: number;
  clientSlug: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}
