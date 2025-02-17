const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
  image: { type: String },
  title: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ad", AdSchema);
