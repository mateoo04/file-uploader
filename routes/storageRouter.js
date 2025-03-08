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
} = require('../controllers/storageController');

const storageRouter = Router();

storageRouter.get('/navigate', filesGet);

storageRouter.get('/download', fileDownloadGet);

storageRouter.post('/file-size', fileSizeGet);

storageRouter.post('/check-name-availability', nameAvailabilityPost);

storageRouter.post('/upload', handleFileInput, fileUploadPost);

storageRouter.post('/create-folder', createFolderPost);

storageRouter.delete('/delete', fileDelete);

storageRouter.put('/rename', renameFilePut);

module.exports = storageRouter;
