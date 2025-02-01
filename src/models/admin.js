const mongoose = require("mongoose");
const User = require("./user");

const AdminSchema = new mongoose.Schema({
  // average_bet_size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, unique: true },
  // game_and_sport_stats: { type: Array, default: [] },
  // inactive_users: { type: Number, default: 0 },
  monthly_users: { type: Number, default: 0 },
  name: { type: String, unique: true },
  // new_signups: { type: Number, default: 0 },
  page_views: { type: Number, default: 0 },
  password: { type: String },
  players: { type: Array, default: [] },
  // players_win_rate: { type: Number, default: 0 },
  role: { type: String },
  // topGames: { type: Array, default: [] },
  // topPlayers: { type: Array, default: [] },
  total_payouts: { type: Number, default: 0 },
  total_players_session: { type: Number, default: 0 },
  // total_profit: { type: Array, default: [] },
  profit: { type: Number, default: 0 },
  // user_growth: { type: Array, default: [] },
});

module.exports = mongoose.model("Admin", AdminSchema);
