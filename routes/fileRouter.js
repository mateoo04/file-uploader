const path = require('node:path');
const { Router } = require('express');

const { filesGet, createFolderPost } = require('../controllers/fileController');

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

fileRouter.get('/navigate', filesGet);

fileRouter.post('/upload', upload.single('file'), (req, res, next) =>
  res.redirect('/')
);

fileRouter.post('/create-folder', createFolderPost);

module.exports = fileRouter;
