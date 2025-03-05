const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport');
require('dotenv').config();

const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const indexRouter = require('./routes/indexRouter');

const app = express();
const port = process.env.PORT || 4000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.set('trust proxy', true);
app.use(passport.session());
app.use(cookieParser());

app.use('/css', express.static('./node_modules/bootstrap/dist/css'));
app.use('/js', express.static('./node_modules/bootstrap/dist/js'));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/', indexRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500);
  res.render('error', {
    message: `Error`,
  });
});

app.listen(port, () =>
  console.log(`Server running - listening on port ${port}`)
);
