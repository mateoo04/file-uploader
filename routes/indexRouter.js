const { Router } = require('express');
const authRouter = require('./authRouter');
const storageRouter = require('./storageRouter');

const indexRouter = Router();

indexRouter.use('/auth', authRouter);
indexRouter.use('/storage', storageRouter);

indexRouter.get('/', (req, res) => res.redirect('/storage/navigate'));

module.exports = indexRouter;
