'use server';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export async function validateLogin(email: string, password: string) {
  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    };
  }

  return { success: true, data: result.data };
}
