const mongoose = require("mongoose");

const URL = process.env.DATABASE_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("Database connected");
    console.log(URL);
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

module.exports = connectDB;
