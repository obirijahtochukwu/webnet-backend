const mongoose = require("mongoose");

const GameHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  game: { type: String, required: true },
  fixtureId: { type: String },
  result: { type: String, enum: ["win", "loss", "pending"], required: true },
  betAmount: { type: Number, required: true },
  multiplier: { type: Number, required: true },
  payout: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameHistory", GameHistorySchema);
