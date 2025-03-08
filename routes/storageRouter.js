const { Router } = require('express');

const {
  filesGet,
  createFolderPost,
  handleFileInput,
  fileUploadPost,
  nameAvailabilityPost,
  fileDelete,
  renameFilePut,
  fileDownloadGet,
  fileSizeGet,
  createShareLinkPost,
  sharedFilesGet,
} = require('../controllers/storageController');

const { isAuth } = require('../middlewares/authMiddleware');

const storageRouter = Router();

storageRouter.get('/navigate', isAuth, filesGet);

storageRouter.get('/download', fileDownloadGet);

storageRouter.get('/shared/:shareLinkId', sharedFilesGet);

storageRouter.post('/file-size', fileSizeGet);

storageRouter.post('/check-name-availability', isAuth, nameAvailabilityPost);

storageRouter.post('/upload', isAuth, handleFileInput, fileUploadPost);

storageRouter.post('/create-folder', isAuth, createFolderPost);

storageRouter.post('/create-share-link', createShareLinkPost);

storageRouter.delete('/delete', isAuth, fileDelete);

storageRouter.put('/rename', isAuth, renameFilePut);

module.exports = storageRouter;
