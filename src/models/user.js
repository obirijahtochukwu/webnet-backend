const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  profileImage: { type: String, default: "uploads/default-player.png" },
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  date_of_birth: { type: String },
  language: { type: String },
  balance: { type: Number, default: 1000 },
  totalPlays: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
