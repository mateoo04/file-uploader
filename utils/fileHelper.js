const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAvailableName(parentFolderId, name) {
  try {
    let items = await prisma.file.findMany({
      where: {
        parentId: parentFolderId,
      },
      select: {
        name: true,
      },
    });

    items = items.map((item) => item.name);

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

async function getAllDescendants(folderId) {
  const children = await prisma.file.findMany({
    where: {
      parentId: folderId,
    },
  });

  for (const child of children) {
    const descendants = await getAllDescendants(child.id);
    children.concat(descendants);
  }

  return children;
}

function adjustFileSize(sizeInBytes) {
  if (sizeInBytes >= 1000000) {
    return `${Math.round((sizeInBytes / 1000000) * 100) / 100} MB`;
  } else if (sizeInBytes >= 1000)
    return `${Math.round((sizeInBytes / 1000) * 100) / 100} KB`;
  else return `${sizeInBytes} B`;
}

module.exports = { getAvailableName, getAllDescendants, adjustFileSize };
