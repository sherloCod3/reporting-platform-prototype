export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    meta?: {
        timestamp: string;
        [ key: string ]: any;
    };
}

export interface ApiError {
    status: number;
    message: string;
    code?: string;
}

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
