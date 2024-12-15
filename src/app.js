const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const corsConfig = require("./middleware/corsConfig");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(corsConfig);
app.use("/image", express.static("image"));

app.use(authRoutes);
app.use(userRoutes);

module.exports = app;
