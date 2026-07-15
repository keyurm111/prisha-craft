const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const MAX_IMAGE_UPLOAD_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Relax mimetype check to allow valid extensions regardless of MIME type
  // (some devices/browsers send generic mimetypes like application/octet-stream).
  // sharp will do full byte-level content validation when saving the image.
  const isImageMime = file.mimetype && file.mimetype.startsWith("image/");
  const isAllowedExt = ALLOWED_IMAGE_EXTENSIONS.has(ext);

  if (isAllowedExt || (isImageMime && ext === "")) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WebP, AVIF, GIF, TIFF, or HEIC images are allowed."), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_UPLOAD_SIZE },
});

const saveOptimizedImage = async (file) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `image-${uniqueSuffix}.webp`;
  const outputPath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 4,
    })
    .toFile(outputPath);

  return filename;
};

module.exports = {
  upload,
  uploadDir,
  MAX_IMAGE_UPLOAD_SIZE,
  saveOptimizedImage,
};
