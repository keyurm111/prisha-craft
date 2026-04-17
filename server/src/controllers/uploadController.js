const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.uploadImage = [
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");

      // Generate URL - the app.js serves /public/uploads at /uploads
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        url: imageUrl
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  }
];
