const { Router } = require('express');
const authRouter = require('./authRouter');
const fileRouter = require('./fileRouter');

const indexRouter = Router();

indexRouter.use('/', authRouter);
indexRouter.use('/file', fileRouter);

indexRouter.get('/', (req, res, next) => res.redirect('/file'));

module.exports = indexRouter;
