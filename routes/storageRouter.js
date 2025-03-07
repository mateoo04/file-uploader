const { Router } = require('express');

const {
  filesGet,
  createFolderPost,
  fileUploadPost,
  nameAvailabilityPost,
  fileDelete,
  renameFilePut,
} = require('../controllers/storageController');

const storageRouter = Router();

storageRouter.get('/navigate', filesGet);

storageRouter.post('/check-name-availability', nameAvailabilityPost);

storageRouter.post('/upload', fileUploadPost, (req, res, next) =>
  res.redirect(
    req.cookies.currentPath
      ? `/storage/navigate?path=${req.cookies.currentPath}`
      : '/storage/navigate'
  )
);

storageRouter.post('/create-folder', createFolderPost);

storageRouter.delete('/delete', fileDelete);

storageRouter.put('/rename', renameFilePut);

module.exports = storageRouter;
