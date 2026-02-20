import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ErrorFactory } from '../types/errors.types.js';

const router = Router();

/** POST /api/auth/login - Autentica usuario e retorna token JWT */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw ErrorFactory.unauthorized('Email e senha são obrigatórios');
    }

    const result = await AuthService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/users', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      throw ErrorFactory.forbidden('Acesso negado');
    }
    const users = await AuthService.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.post('/users', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      throw ErrorFactory.forbidden('Acesso negado');
    }
    const { email, password, role, clientId } = req.body;
    if (!email || !password || !role || !clientId) {
      throw ErrorFactory.badRequest('Dados incompletos');
    }

    const newUser = await AuthService.createUser({
      email,
      password,
      role,
      clientId
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      throw ErrorFactory.forbidden('Acesso negado');
    }
    const id = Number(req.params.id);
    const { email, password, role, clientId, active } = req.body;

    await AuthService.updateUser(id, {
      email,
      password,
      role,
      clientId,
      active
    });
    res.json({ success: true, message: 'Usuário atualizado' });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      throw ErrorFactory.forbidden('Acesso negado');
    }
    const id = Number(req.params.id);
    await AuthService.deleteUser(id);
    res.json({ success: true, message: 'Usuário removido' });
  } catch (error) {
    next(error);
  }
});

export default router;
