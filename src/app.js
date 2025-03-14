const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const corsConfig = require("./middleware/corsConfig");
const cloudinary = require("cloudinary").v2;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
require("dotenv").config();

const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ extended: true, limit: "10mb" }));
app.use(corsConfig);
app.use("/uploads", express.static("uploads"));
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);

module.exports = app;
