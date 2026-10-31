import passport from 'passport';

const MISSING_FIELDS_MESSAGE = 'Faltan campos obligatorios';

export const passportCall = (strategy) => (req, res, next) => {
  const options = { session: false, badRequestMessage: MISSING_FIELDS_MESSAGE };

  passport.authenticate(strategy, options, (error, user, info, status) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      const isKnownFailure = Boolean(info?.status) || status === 400;
      return res.status(info?.status ?? status ?? 401).json({
        status: 'error',
        message: isKnownFailure ? info.message : 'No autenticado'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
