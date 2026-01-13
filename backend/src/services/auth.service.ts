import bcrypt from 'bcryptjs'; // compara senha com hash
const jwt = require('jsonwebtoken'); // gera/verifica token
import { env } from '../config/env.config.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import type { JwtPayload, LoginRequest } from '../types/auth.types.js';
import { ErrorFactory } from '../types/errors.types.js';

export const AuthService = {
    // login do sistema
    async login({ email, password }: LoginRequest) {
        const user = await AuthRepository.findUserByEmail(email);
        if (!user) {
            throw ErrorFactory.unauthorized('Email ou senha incorretos');
        }
        const ok = await bcrypt.compare(password, user.password_hash); // compara a senha
        if (!ok) {
            throw ErrorFactory.unauthorized('Email ou senha incorretos');
        }

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            clientId: user.client_id,
            clientSlug: user.client_slug,
        };

        const token = jwt.sign(payload, env.JWT_SECRET, { // assina o token
            expiresIn: env.JWT_EXPIRES_IN,
        });

        return {
            success: true,
            data: {
                token,
                user: { id: user.id, email: user.email, role: user.role },
                client: { id: user.client_id, slug: user.client_slug },
                expiresIn: env.JWT_EXPIRES_IN,
            },
        };
    },

    // valida token e retorna payload
    verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        } catch {
            throw ErrorFactory.unauthorized('Token inválido ou expirado');
        }
    },
};