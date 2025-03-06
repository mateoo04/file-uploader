const fs = require('fs');
const path = require('node:path');
const multer = require('multer');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

function createPath(currentPath, fileName) {
  return currentPath
    ? path.join(uploadDir, currentPath, fileName)
    : path.join(uploadDir, fileName);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = req.cookies.currentPath
      ? path.join(uploadDir, req.cookies.currentPath)
      : uploadDir;
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
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

      if (fs.lstatSync(fullPath).isDirectory()) {
        return { name: item, type: 'directory' };
      } else if (fs.lstatSync(fullPath).isFile()) {
        const ext = path.extname(item).toLowerCase().slice(1);
        return { name: item, type: ext };
      }
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
      `/navigate?path=${req.cookies.currentPath || req.body?.currentPath}`
    );
  }

  return res.status(400).json({ error: 'Folder already exists' });
}

function nameAvailabilityPost(req, res, next) {
  const folderName = req.body.folderName;
  const currentPath = req.cookies.currentPath || req.body?.currentPath;
  if (fs.existsSync(createPath(currentPath, folderName)))
    return res.json({ available: false });

  return res.json({ available: true });
}

function fileDelete(req, res, next) {
  const pathToDelete = createPath(req.cookies?.currentPath, req.query.fileName);

  if (fs.existsSync(pathToDelete)) {
    if (fs.lstatSync(pathToDelete).isDirectory()) {
      fs.rm(pathToDelete, { recursive: true }, (err) => {
        if (err) return next(err);
        res.redirect(`/navigate?path=${req.cookies.currentPath}`);
      });
    } else if (fs.lstatSync(pathToDelete).isFile()) {
      fs.unlink(pathToDelete, (err) => {
        if (err) return next(err);
        res.redirect(`/navigate?path=${req.cookies.currentPath}`);
      });
    }
  }
}

module.exports = {
  filesGet,
  createFolderPost,
  fileUploadPost,
  nameAvailabilityPost,
  fileDelete,
};
