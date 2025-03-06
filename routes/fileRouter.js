const { Router } = require('express');

const {
  filesGet,
  createFolderPost,
  fileUploadPost,
  nameAvailabilityPost,
} = require('../controllers/fileController');

const fileRouter = Router();

fileRouter.get('/navigate', filesGet);

fileRouter.post('/check-folder-name-availability', nameAvailabilityPost);

fileRouter.post('/upload', fileUploadPost, (req, res, next) =>
  res.redirect(
    req.cookies.currentPath
      ? `/navigate?path=${req.cookies.currentPath}`
      : '/navigate'
  )
);

fileRouter.post('/create-folder', createFolderPost);

module.exports = fileRouter;
