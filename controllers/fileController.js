const fs = require('fs');
const path = require('node:path');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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
  const folderName = req.body.name;
  const currentPath = req.cookies.currentPath || req.body.currentPath;
  let folderPath = currentPath
    ? path.join(uploadDir, currentPath, folderName)
    : path.join(uploadDir, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });

    if (folderPath.startsWith('uploads')) {
      folderPath = folderPath.slice(7);
    }

    return res.redirect(`/navigate?path=${currentPath}`);
  }

  return res.status(400).json({ error: 'Folder already exists' });
}

module.exports = { filesGet, createFolderPost };
