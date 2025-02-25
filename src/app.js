const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const corsConfig = require("./middleware/corsConfig");
const cloudinary = require("cloudinary").v2;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ extended: true, limit: "10mb" }));
app.use(corsConfig);
app.use("/uploads", express.static("uploads"));

cloudinary.config({
  cloud_name: "dugfquup5",
  api_key: "255653463535199",
  api_secret: "O0pwMidgV3cSU_G7a1V65PrVdng", // Click 'View API Keys' above to copy your API secret
});

app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);

module.exports = app;
