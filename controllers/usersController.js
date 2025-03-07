const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const validateSignUp = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at lest 3 characters.')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('First name can only contain letters, numbers and underscores')
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase character')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[\W]/)
    .withMessage('Password must contain at least one special character')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .escape(),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .escape(),
];

const validateLogIn = [
  body('username')
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .trim()
    .escape()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

async function signUpPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('sign-up', {
      errors: errors.array().map((error) => error.msg),
      user: req.body,
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: req.body.username },
  });

  if (existingUser) {
    return res.render('sign-up', {
      errors: ['Username not available'],
      user: req.body,
    });
  }

  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
}

async function checkLogInValidationPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    return res.render('log-in', {
      errors: errors.array().map((error) => error.msg),
    });

  next();
}

function logOutPost(req, res) {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/auth/log-in');
  });
}

module.exports = {
  validateSignUp,
  validateLogIn,
  signUpPost,
  checkLogInValidationPost,
  logOutPost,
};
