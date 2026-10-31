import { signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

const COOKIE_NAME = 'currentUser';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production'
};

export const register = (req, res) => {
  res.status(201).json({ status: 'success', payload: req.user });
};

export const login = (req, res) => {
  const { id, email, role } = req.user;
  const token = signToken({ id, email, role });

  res
    .cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 3600000 })
    .status(200)
    .json({ status: 'success', message: 'Login correcto' });
};

export const current = (req, res) => {
  const { id, email, role } = req.user;
  res.status(200).json({ status: 'success', payload: { id, email, role } });
};

export const logout = (req, res) => {
  res
    .clearCookie(COOKIE_NAME, cookieOptions)
    .status(200)
    .json({ status: 'success', message: 'Sesión cerrada' });
};
