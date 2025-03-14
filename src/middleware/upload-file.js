const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop()); // Rename files to avoid conflicts
  },
});

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
    return result.secure_url;
  } catch (err) {
    res.status(500).json({ msg: err });
    throw err; // Re-throw the error to be handled by the caller
  }
};

const upload = multer({ storage: storage });

module.exports = { upload, uploadToCloudinary };
