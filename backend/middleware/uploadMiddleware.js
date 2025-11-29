import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/payments/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "payment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("Processing file:", file.originalname, file.mimetype);
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.log("File rejected - not an image:", file.mimetype);
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("paymentScreenshot");

// Wrap multer with error handling
const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File too large. Maximum size is 5MB." });
      }
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    } else if (err) {
      console.error("File upload error:", err);
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    }
    next();
  });
};

export default uploadWithErrorHandling;
