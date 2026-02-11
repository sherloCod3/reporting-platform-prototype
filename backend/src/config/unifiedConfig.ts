import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
// Attempt to load from parent directory if running from backend subfolder
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
// Also try loading from current directory (overrides if present)
dotenv.config();

export const unifiedConfig = {
    server: {
        port: process.env.PORT || 3001,
        env: process.env.NODE_ENV || "development",
    },
    db: { // Default DB (might be same as auth for now)
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "qreports",
        port: Number(process.env.DB_PORT) || 3306,
    },
    authDb: { // Central Auth/Report DB
        host: process.env.AUTH_DB_HOST || process.env.DB_HOST || "localhost",
        user: process.env.AUTH_DB_USER || process.env.DB_USER || "root",
        password: process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD || "password",
        database: process.env.AUTH_DB_NAME || process.env.DB_NAME || "qreports",
        port: Number(process.env.AUTH_DB_PORT) || Number(process.env.DB_PORT) || 3306,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "default_secret_dont_use_in_prod",
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    },
} as const;
