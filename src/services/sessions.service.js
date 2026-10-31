import * as usersRepository from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { AppError } from '../utils/AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isEmpty = (value) => typeof value !== 'string' || value.trim() === '';

const toPublicUser = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role
});

export const register = async ({ first_name, last_name, email, password }) => {
  if ([first_name, last_name, email, password].some(isEmpty)) {
    throw new AppError('Faltan campos obligatorios', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('El formato del email no es válido', 400);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      400
    );
  }

  const existingUser = await usersRepository.getByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('El email ya está registrado', 409);
  }

  const hashedPassword = await hashPassword(password);

  try {
    const newUser = await usersRepository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });
    return toPublicUser(newUser);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('El email ya está registrado', 409);
    }
    throw error;
  }
};

export const authenticate = async ({ email, password }) => {
  if ([email, password].some(isEmpty)) {
    throw new AppError('Faltan campos obligatorios', 400);
  }

  const user = await usersRepository.getByEmail(email.trim().toLowerCase());
  const isValidPassword = user ? await comparePassword(password, user.password) : false;

  if (!isValidPassword) {
    throw new AppError('Credenciales inválidas', 401);
  }

  return { id: String(user._id), email: user.email, role: user.role };
};
