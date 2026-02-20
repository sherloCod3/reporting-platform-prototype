import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import type { JwtPayload, LoginRequest } from '../types/auth.types.js';
import { ErrorFactory } from '../types/errors.types.js';

export const AuthService = {
  /** Autentica o usuario e gera um JWT com os dados de sessao. */
  async login({ email, password }: LoginRequest) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw ErrorFactory.unauthorized('Email ou senha incorretos');
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw ErrorFactory.unauthorized('Email ou senha incorretos');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      clientId: user.client_id,
      clientSlug: user.client_slug
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    } as jwt.SignOptions);

    return {
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, role: user.role },
        client: { id: user.client_id, slug: user.client_slug },
        expiresIn: env.JWT_EXPIRES_IN
      }
    };
  },

  /** Verifica e decodifica o JWT. Lanca erro se invalido ou expirado. */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw ErrorFactory.unauthorized('Token inválido ou expirado');
    }
  },

  async getUsers() {
    return AuthRepository.findAllUsers();
  },

  async createUser(data: {
    email: string;
    password: string;
    role: string;
    clientId: number;
  }) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);

    const id = await AuthRepository.createUser({
      email: data.email,
      password_hash: hash,
      role: data.role,
      client_id: data.clientId
    });

    return { id, ...data };
  },

  async updateUser(
    id: number,
    data: {
      email?: string;
      password?: string;
      role?: string;
      clientId?: number;
      active?: number;
    }
  ) {
    let password_hash: string | undefined;

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(data.password, salt);
    }

    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (password_hash) updateData.password_hash = password_hash;
    if (data.role) updateData.role = data.role;
    if (data.clientId) updateData.client_id = data.clientId;
    if (data.active !== undefined) updateData.active = data.active;

    await AuthRepository.updateUser(id, updateData);
  },

  async deleteUser(id: number) {
    await AuthRepository.deleteUser(id);
  }
};
