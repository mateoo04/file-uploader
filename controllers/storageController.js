const path = require('node:path');
const { format, addDays, isBefore } = require('date-fns');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { supabase } = require('../config/supabase');

const prisma = new PrismaClient();

const {
  getAvailableName,
  getAllDescendants,
  adjustFileSize,
} = require('../utils/fileHelper');

const upload = multer(multer.memoryStorage());

const handleFileInput = upload.single('file');

async function getItems(folderId, userId) {
  let items, parentFolder;

  const findItems = () =>
    prisma.file.findMany({
      where: {
        userId,
        parentId: folderId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

  if (folderId) {
    [items, parentFolder] = await Promise.all([
      findItems(),
      prisma.file.findUnique({
        where: {
          id: folderId,
        },
        include: {
          parent: true,
        },
      }),
    ]);
  } else items = await findItems();

  items = items.map((item) => ({
    ...item,
    createdAt: format(item.createdAt, 'd.M.yyy., H:mm'),
  }));

  return { items, parentFolder };
}

async function filesGet(req, res, next) {
  try {
    const parentFolderId = req.query?.folder == null ? null : req.query.folder;
    const shareLinkId = req.query?.shareLinkId;

    const { items, parentFolder } = await getItems(
      parentFolderId,
      res.locals.user.id
    );

    if (parentFolder) {
      res.cookie('currentFolder', parentFolder, {
        httpOnly: false,
        sameSite: 'strict',
      });
    } else res.clearCookie('currentFolder');

    res.render('index', {
      items,
      currentFolder: parentFolder?.name,
      backPath:
        parentFolder && parentFolder.parentId != null
          ? `/storage/navigate?folder=${parentFolder.parentId}`
          : '/storage/navigate',
      shareLink:
        req.query?.shareLinkId != null
          ? `${req.protocol}://${req.get('host')}/storage/shared/${shareLinkId}`
          : undefined,
      showLogOut: true,
    });
  } catch (err) {
    next(err);
  }
}

async function sharedFilesGet(req, res, next) {
  try {
    const shareLinkId = req.params.shareLinkId;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        id: shareLinkId,
      },
    });

    if (isBefore(shareLink.expiresAt, new Date())) {
      res.status(400).render('error', { message: 'Link has expired.' });
    }

    const parentFolderId =
      req.query?.folder == null ? shareLink.folderId : req.query.folder;

    const { items, parentFolder } = await getItems(
      parentFolderId,
      shareLink.userId
    );

    const descendantFolderIds = (await getAllDescendants(shareLink.folderId))
      .filter((descendant) => descendant.isFolder)
      .map((folder) => folder.id);

    res.render('shareView', {
      items,
      currentFolder: parentFolder?.name,
      backPath:
        parentFolder &&
        parentFolder.parentId != null &&
        descendantFolderIds.includes(parentFolder.parentId)
          ? `/storage/shared/${shareLinkId}?folder=${parentFolder.parentId}`
          : `/storage/shared/${shareLinkId}`,
      shareLinkId,
    });
  } catch (err) {
    next(err);
  }
}

async function createFolderPost(req, res, next) {
  const folderName = req.body.folderName;
  const currentFolderId =
    req.cookies.currentFolder != null ? req.cookies.currentFolder.id : null;

  try {
    await prisma.file.create({
      data: {
        name: folderName,
        isFolder: true,
        parentId: currentFolderId,
        userId: res.locals.user.id,
      },
    });

    return res.redirect(
      req.cookies.currentFolder != null
        ? `/storage/navigate?folder=${currentFolderId}`
        : '/storage/navigate'
    );
  } catch (err) {
    next(err);
  }
}

async function nameAvailabilityPost(req, res) {
  try {
    const fileName = req.body.folderName || req.body.fileName;
    const currentFolderId =
      req.cookies.currentFolder != null ? req.cookies.currentFolder.id : null;

    const items = await prisma.file.findMany({
      where: {
        userId: res.locals.user.id,
        parentId: currentFolderId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (items.map((item) => item.name).includes(fileName))
      return res.json({ available: false });

    return res.json({ available: true });
  } catch (err) {
    res.status(500).send('Error while checking name availability');
  }
}

async function deleteItemAndDescendants(req, res, next, fileId) {
  try {
    const children = await prisma.file.findMany({
      where: {
        parentId: fileId,
      },
    });

    for (const child of children) {
      if (child.id != null && child.id != '')
        await deleteItemAndDescendants(req, res, next, child.id);
    }

    const deletedItem = await prisma.file.delete({
      where: {
        id: fileId,
      },
    });

    if (deletedItem.storagePath) {
      const { data, error } = await supabase.storage
        .from('files')
        .remove([deletedItem.storagePath]);

      if (error)
        console.err('Error while deleting a file from Supabase:', error);
    }
  } catch (err) {
    if (!res.headersSent) next(new Error('Error while deleting items: ' + err));
  }
}

async function fileDelete(req, res, next) {
  try {
    await deleteItemAndDescendants(req, res, next, req.query.fileId);

    if (!res.headersSent) {
      return res.redirect(
        req.cookies.currentFolder != null
          ? `/storage/navigate?folder=${req.cookies.currentFolder.id}`
          : '/storage/navigate'
      );
    }
  } catch (err) {
    if (!res.headersSent) next(new Error('Error while deleting items: ' + err));
  }
}

async function renameFilePut(req, res, next) {
  const fileId = req.query.fileId;
  const newName = await getAvailableName(
    req.cookies.currentFolder != null ? req.cookies.currentFolder.id : null,
    req.body.fileName
  );

  try {
    await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        name: newName,
      },
    });

    return res.redirect(
      req.cookies.currentFolder != null
        ? `/storage/navigate?folder=${req.cookies.currentFolder.id}`
        : '/storage/navigate'
    );
  } catch (err) {
    next(`Error while renaming file: ${err}`);
  }
}

async function fileDownloadGet(req, res, next) {
  const fileId = req.query.fileId;

  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    const { data, error } = await supabase.storage
      .from('files')
      .download(file.storagePath);

    if (error) next('Failed downloading the file from Supabase: ' + error);

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`
    );

    res.setHeader('Content-Type', data.type);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function fileUploadPost(req, res, next) {
  if (!req.file) {
    return next('No file uploaded.');
  } else if (req.file.size > 50000000) {
    return res
      .status(400)
      .render('error', { message: 'Maximum file size of 50 MB was exceeded!' });
  }

  req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString(
    'utf8'
  );
  const fileName = Date.now() + '_' + req.file.originalname;

  try {
    const { data, error } = await supabase.storage
      .from('files')
      .upload(fileName.replace(/[^a-zA-Z0-9_-]/g, '_'), req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error)
      next('Error uploading file to Supabase: ' + JSON.stringify(error));

    const availableName = await getAvailableName(
      req.cookies.currentFolder != null ? req.cookies.currentFolder.id : null,
      req.file.originalname
    );

    await prisma.file.create({
      data: {
        name: availableName,
        isFolder: false,
        parentId:
          req.cookies.currentFolder != null
            ? req.cookies.currentFolder.id
            : null,
        storagePath: data.path,
        userId: res.locals.user.id,
      },
    });

    return res.redirect(
      req.cookies.currentFolder != null
        ? `/storage/navigate?folder=${req.cookies.currentFolder.id}`
        : '/storage/navigate'
    );
  } catch (err) {
    next(err);
  }
}

async function fileSizeGet(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.body.fileId,
      },
    });

    let totalSize = 0;

    if (!file.isFolder) {
      const { data, error } = await supabase.storage.from('files').list('', {
        search: file.storagePath,
      });

      let size = adjustFileSize(data[0].metadata.size);

      if (error) return next(error);
      else return res.json({ size });
    } else {
      const descendants = await getAllDescendants(file.id);

      for (const descendant of descendants) {
        const { data, error } = await supabase.storage.from('files').list('', {
          search: descendant.storagePath,
        });

        if (error) return next(error);

        totalSize += data[0].metadata.size;
      }

      return res.json({ size: adjustFileSize(totalSize) });
    }
  } catch (err) {
    res.status(500).send('Error while calculating file size');
  }
}

async function createShareLinkPost(req, res, next) {
  try {
    const shareLink = await prisma.shareLink.create({
      data: {
        userId: res.locals.user.id,
        folderId: req.cookies.currentFolder?.id,
        expiresAt: addDays(new Date(), Number(req.body.duration) || 1),
      },
    });

    return res.redirect(
      req.cookies.currentFolder != null
        ? `/storage/navigate?folder=${req.cookies.currentFolder.id}&shareLinkId=${shareLink.id}`
        : `/storage/navigate?shareLinkId=${shareLink.id}`
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  filesGet,
  sharedFilesGet,
  createFolderPost,
  handleFileInput,
  fileUploadPost,
  nameAvailabilityPost,
  fileDelete,
  renameFilePut,
  fileDownloadGet,
  fileSizeGet,
  createShareLinkPost,
};
