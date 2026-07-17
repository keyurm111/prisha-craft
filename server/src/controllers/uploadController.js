const multer = require('multer');
const {
  MAX_IMAGE_UPLOAD_SIZE,
  saveOptimizedImage,
  upload,
} = require('../utils/fileUpload');

const formatBytes = (bytes) => `${Math.round(bytes / (1024 * 1024))}MB`;

const isStoragePermissionError = (err) => {
  const message = String(err?.message || '').toLowerCase();

  return (
    err?.code === 'EACCES' ||
    err?.code === 'EPERM' ||
    message.includes('permission denied') ||
    message.includes('unable to open for write') ||
    message.includes('write error')
  );
};

const handleUploadError = (err, res) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'fail',
        message: `Image is too large. Maximum allowed size is ${formatBytes(MAX_IMAGE_UPLOAD_SIZE)}.`,
      });
    }

    return res.status(400).json({
      status: 'fail',
      message: `Upload error: ${err.message}`,
    });
  }

  return res.status(400).json({
    status: 'fail',
    message: err.message,
  });
};

exports.uploadImage = (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, res);
    }

    try {
      if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No image uploaded' });
      }

      const filename = await saveOptimizedImage(req.file);
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      res.status(200).json({
        status: 'success',
        url: imageUrl,
        filename,
        format: 'webp',
      });
    } catch (err) {
      console.error('Image upload processing error:', err);

      if (isStoragePermissionError(err)) {
        return res.status(500).json({
          status: 'error',
          message: 'Image upload storage is not writable. Please check the server upload directory permissions.',
        });
      }

      res.status(400).json({
        status: 'fail',
        message: `Image could not be processed: ${err.message}. Please upload a valid JPG, JPEG, PNG, WebP, AVIF, GIF, TIFF, or HEIC image.`,
      });
    }
  });
};
