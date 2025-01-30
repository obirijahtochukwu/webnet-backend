const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number },
  email: { type: String },
  name: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Token", TokenSchema);
