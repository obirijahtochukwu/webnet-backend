const mongoose = require("mongoose");

const URL = "mongodb://localhost:27017";

const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

module.exports = connectDB;
