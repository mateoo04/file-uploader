const path = require('node:path');
const { Router } = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  },
});

const upload = multer({ storage });

const fileRouter = Router();

fileRouter.get('/', (req, res) => res.render('index'));
fileRouter.post('/upload', upload.single('file'), (req, res, next) =>
  res.redirect('/file')
);

module.exports = fileRouter;
