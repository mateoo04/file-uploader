const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('node:path');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

function createPath(currentPath, fileName) {
  return currentPath
    ? path.join(uploadDir, currentPath, fileName)
    : path.join(uploadDir, fileName);
}

async function getAvailableName(folderPath, name) {
  try {
    const items = await fsPromises.readdir(folderPath);
    if (!items.includes(name)) {
      return name;
    }

    const ext = path.extname(name);

    let num = 1;
    while (items.includes(`${name.replace(ext, '')} (${num})${ext}`)) {
      num++;
    }

    return `${name.replace(ext, '')} (${num})${ext}`;
  } catch (err) {
    throw new Error(`File name error: ${err}`);
  }
}

function getDirectorySizeSync(directory) {
  let totalSize = 0;

  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(directory, file.name);
      const stats = fs.lstatSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySizeSync(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  return totalSize;
}

module.exports = { createPath, getAvailableName, getDirectorySizeSync };
