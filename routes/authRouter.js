const { Router } = require('express');
const passport = require('passport');
const {
  validateSignUp,
  validateLogIn,
  signUp,
  checkLogInValidation,
  logOut,
} = require('../controllers/usersController');

const { isAuth, isNotAuth } = require('../middlewares/authMiddleware');

const authRouter = Router();

authRouter.get('/sign-up', isNotAuth, (req, res) => res.render('sign-up'));
authRouter.get('/log-in', isNotAuth, (req, res) =>
  res.render('log-in', { errors: [...new Set(req.session?.messages)] })
);

authRouter.post('/sign-up', validateSignUp, signUp);
authRouter.post(
  '/log-in',
  validateLogIn,
  checkLogInValidation,
  passport.authenticate('local', {
    failureRedirect: '/log-in',
    successRedirect: '/',
    failureMessage: 'Invalid username or password entered',
  })
);
authRouter.post('/log-out', logOut);

module.exports = authRouter;
