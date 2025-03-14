const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Multer memory storage (stores files in memory as buffers)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to upload a file buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });

    // Create a readable stream from the buffer and pipe it to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null); // Signal end of stream
    bufferStream.pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };
