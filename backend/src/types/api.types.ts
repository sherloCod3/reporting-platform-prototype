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