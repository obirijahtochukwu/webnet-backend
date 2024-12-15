const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  date_of_birth: { type: String },
  language: { type: String },
  balance: { type: Number },
  cart: { type: Array, default: [] },
});

module.exports = mongoose.model("User", UserSchema);
