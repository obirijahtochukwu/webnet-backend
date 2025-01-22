const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  page_views: { type: Number, default: 0 },
  monthly_users: { type: Number, default: 0 },
  new_signups: { type: Number, default: 0 },
  total_payouts: { type: Number, default: 0 },
  total_profit: { type: Array, default: [] },
  topGames: { type: Array, default: [] },
  topPlayers: { type: Array, default: [] },
});

module.exports = mongoose.model("Admin", AdminSchema);
