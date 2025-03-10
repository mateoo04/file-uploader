const { Router } = require('express');
const passport = require('passport');
const {
  validateSignUp,
  validateLogIn,
  signUpPost,
  checkLogInValidationPost,
  logOutPost,
} = require('../controllers/usersController');

const { isNotAuth } = require('../middlewares/authMiddleware');

const authRouter = Router();

authRouter.get('/sign-up', isNotAuth, (req, res) => res.render('sign-up'));
authRouter.get('/log-in', isNotAuth, (req, res) =>
  res.render('log-in', { errors: [...new Set(req.session?.messages)] })
);

authRouter.post('/sign-up', validateSignUp, signUpPost);
authRouter.post(
  '/log-in',
  validateLogIn,
  checkLogInValidationPost,
  passport.authenticate('local', {
    failureRedirect: '/auth/log-in',
    successRedirect: '/',
    failureMessage: 'Invalid username or password entered',
  })
);
authRouter.post('/log-out', logOutPost);

module.exports = authRouter;
