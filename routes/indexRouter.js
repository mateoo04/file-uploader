const { Router } = require('express');
const authRouter = require('./authRouter');

const indexRouter = Router();

indexRouter.use('/', authRouter);

indexRouter.get('/', (req, res) => res.render('index'));

module.exports = indexRouter;
