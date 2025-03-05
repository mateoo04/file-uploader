const { Router } = require('express');
const authRouter = require('./authRouter');
const fileRouter = require('./fileRouter');

const indexRouter = Router();

indexRouter.use('/', authRouter);
indexRouter.use('/', fileRouter);

indexRouter.get('/', (req, res) => res.redirect('/navigate'));

module.exports = indexRouter;
