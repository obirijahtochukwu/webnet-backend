const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const corsConfig = require("./middleware/corsConfig");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow all origins
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle preflight request
  }
  next();
});

app.use("/image", express.static("image"));

app.use(authRoutes);
app.use(userRoutes);

module.exports = app;
