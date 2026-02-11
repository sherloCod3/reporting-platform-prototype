export interface JwtPayload {
    userId: number;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    clientId: number;
    clientSlug: string;
    iat?: number; // issued at (solicitado em:)
    exp?: number; // expires
}

export interface LoginRequest {
    email: string;
    password: string;
}