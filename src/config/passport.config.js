import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import * as sessionsService from '../services/sessions.service.js';
import { AppError } from '../utils/AppError.js';
import { env } from './env.js';

const resolveWith = async (action, done) => {
  try {
    const user = await action();
    done(null, user);
  } catch (error) {
    if (error instanceof AppError) {
      return done(null, false, { message: error.message, status: error.status });
    }
    done(error);
  }
};

const registerStrategy = () =>
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) =>
      resolveWith(() => sessionsService.register({ ...req.body, email, password }), done)
  );

const loginStrategy = () =>
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) =>
      resolveWith(() => sessionsService.authenticate({ email, password }), done)
  );

const cookieExtractor = (req) => req?.cookies?.currentUser ?? null;

const currentStrategy = () =>
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: env.JWT_SECRET,
      algorithms: ['HS256']
    },
    (payload, done) => done(null, { id: payload.id, email: payload.email, role: payload.role })
  );

const strategies = {
  register: registerStrategy,
  login: loginStrategy,
  current: currentStrategy
};

export const initializePassport = () => {
  Object.entries(strategies).forEach(([name, createStrategy]) => {
    passport.use(name, createStrategy());
  });
};
