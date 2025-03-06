const fs = require('fs');
const path = require('node:path');
const multer = require('multer');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

function createNewFolderPath(req) {
  const folderName = req.body.folderName;
  const currentPath = req.cookies.currentPath || req.body?.currentPath;
  return currentPath
    ? path.join(uploadDir, currentPath, folderName)
    : path.join(uploadDir, folderName);
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
  let folderPath = createNewFolderPath(req);

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
  if (fs.existsSync(createNewFolderPath(req)))
    return res.json({ available: false });

  return res.json({ available: true });
}

module.exports = {
  filesGet,
  createFolderPost,
  fileUploadPost,
  nameAvailabilityPost,
};
