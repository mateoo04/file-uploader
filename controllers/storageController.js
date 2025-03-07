const fs = require('fs');
const path = require('node:path');
const { format } = require('date-fns');
const multer = require('multer');

const {
  createPath,
  getAvailableName,
  getDirectorySizeSync,
} = require('../utils/fileHelper');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = req.cookies.currentPath
      ? path.join(uploadDir, req.cookies.currentPath)
      : uploadDir;
    cb(null, folderPath);
  },
  filename: async (req, file, cb) => {
    getAvailableName(
      req.cookies.currentPath
        ? path.join(uploadDir, req.cookies.currentPath)
        : uploadDir,
      file.originalname
    )
      .then((availableName) => {
        console.log('name:', availableName);
        return cb(null, availableName);
      })
      .catch((err) => cb(err));
  },
});

const upload = multer({ storage });

const fileUploadPost = upload.single('file');

function filesGet(req, res, next) {
  let folderPath = path.join(uploadDir, req.query.path || '');

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  fs.readdir(folderPath, (err, items) => {
    if (err) {
      return next(err);
    }

    items = items.map((item) => {
      const fullPath = path.join(folderPath, item);

      const stats = fs.lstatSync(fullPath);

      return {
        name: item,
        type: stats.isDirectory()
          ? 'directory'
          : path.extname(item).toLowerCase().slice(1),
        size:
          stats.size +
          (stats.isDirectory() ? getDirectorySizeSync(fullPath) : 0) +
          ' KB',
        uploadDate: format(stats.birthtime, `d.M.yyyy., H:mm`),
      };
    });

    if (folderPath.startsWith('uploads')) {
      folderPath = folderPath.slice(7);
    }

    res.cookie('currentPath', folderPath, {
      httpOnly: false,
      sameSite: 'strict',
    });

    res.render('index', {
      items,
      currentPath: folderPath,
    });
  });
}

function createFolderPost(req, res, next) {
  const folderName = req.body.folderName;
  const currentPath = req.cookies.currentPath || req.body?.currentPath;
  let folderPath = createPath(currentPath, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });

    if (folderPath.startsWith('uploads')) {
      folderPath = folderPath.slice(7);
    }

    return res.redirect(
      `/storage/navigate?path=${
        req.cookies.currentPath || req.body?.currentPath
      }`
    );
  }

  return res.status(400).json({ error: 'Folder already exists' });
}

function nameAvailabilityPost(req, res, next) {
  const fileName = req.body.folderName || req.body.fileName;
  const currentPath = req.cookies.currentPath || req.body?.currentPath;
  if (fs.existsSync(createPath(currentPath, fileName)))
    return res.json({ available: false });

  return res.json({ available: true });
}

function fileDelete(req, res, next) {
  const pathToDelete = createPath(req.cookies?.currentPath, req.query.fileName);

  if (fs.existsSync(pathToDelete)) {
    if (fs.lstatSync(pathToDelete).isDirectory()) {
      fs.rm(pathToDelete, { recursive: true }, (err) => {
        if (err) return next(err);
        res.redirect(`/storage/navigate?path=${req.cookies.currentPath}`);
      });
    } else if (fs.lstatSync(pathToDelete).isFile()) {
      fs.unlink(pathToDelete, (err) => {
        if (err) return next(err);
        res.redirect(`/storage/navigate?path=${req.cookies.currentPath}`);
      });
    }
  }
}

async function renameFilePut(req, res, next) {
  const oldName = req.query.previousName;
  const newName = await getAvailableName(
    req.cookies.currentPath
      ? path.join(uploadDir, req.cookies.currentPath)
      : uploadDir,
    req.body.fileName
  );

  const oldPath = createPath(req.cookies.currentPath, oldName);
  const newPath = oldPath.slice(0, -oldName.length) + newName;

  fs.rename(oldPath, newPath, function (err) {
    if (err) next(`Error while renaming file: ${err}`);

    res.redirect(`/storage/navigate?path=${req.cookies.currentPath}`);
  });
}

module.exports = {
  filesGet,
  createFolderPost,
  fileUploadPost,
  nameAvailabilityPost,
  fileDelete,
  renameFilePut,
};
