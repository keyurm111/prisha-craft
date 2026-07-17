const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadDir = path.join(__dirname, "../../public/uploads");

// --- DIAGNOSTIC LOGGING (startup) ---
console.log("[Upload] uploadDir resolved to:", uploadDir);
try {
  if (!fs.existsSync(uploadDir)) {
    console.log("[Upload] Directory does not exist, creating...");
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o775 });
    console.log("[Upload] Directory created successfully.");
  } else {
    console.log("[Upload] Directory already exists.");
  }
  // Log permissions and owner info
  const stats = fs.statSync(uploadDir);
  console.log("[Upload] Dir permissions (octal):", (stats.mode & 0o777).toString(8));
  console.log("[Upload] Dir uid/gid:", stats.uid, "/", stats.gid);
  console.log("[Upload] Process uid/gid:", process.getuid ? process.getuid() : "N/A", "/", process.getgid ? process.getgid() : "N/A");
} catch (err) {
  console.error("[Upload] CRITICAL - Failed to create/stat uploadDir:", err);
}
// --- END DIAGNOSTIC LOGGING ---

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

  console.log("[Upload] Saving image:", filename);
  console.log("[Upload] Output path:", outputPath);
  console.log("[Upload] File originalname:", file.originalname, "| mimetype:", file.mimetype, "| size:", file.size);

  // Check if uploadDir is still writable at request time
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log("[Upload] uploadDir is writable ✓");
  } catch (e) {
    console.error("[Upload] uploadDir is NOT writable:", e.message);
    console.error("[Upload] uploadDir stats:", fs.statSync(uploadDir));
    console.error("[Upload] process uid:", process.getuid ? process.getuid() : "N/A");
  }

  try {
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

    console.log("[Upload] Image saved successfully:", filename);
  } catch (err) {
    console.error("[Upload] sharp.toFile FAILED:");
    console.error("  message:", err.message);
    console.error("  code:", err.code);
    console.error("  outputPath:", outputPath);
    console.error("  uploadDir exists:", fs.existsSync(uploadDir));
    throw err;
  }

  return filename;
};

module.exports = {
  upload,
  uploadDir,
  MAX_IMAGE_UPLOAD_SIZE,
  saveOptimizedImage,
};
