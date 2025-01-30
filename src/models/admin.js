const mongoose = require("mongoose");
const User = require("./user");

const AdminSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  page_views: { type: Number, default: 0 },
  monthly_users: { type: Number, default: 0 },
  new_signups: { type: Number, default: 0 },
  total_payouts: { type: Number, default: 0 },
  total_profit: { type: Array, default: [] },
  topGames: { type: Array, default: [] },
  players: { type: Array, default: [] },
  topPlayers: { type: Array, default: [] },
  average_bet_size: { type: Number, default: 0 },
  user_growth: { type: Array, default: [] },
  players_win_rate: { type: Number, default: 0 },
  total_players_session: { type: Number, default: 0 },
  game_and_sport_stats: { type: Array, default: [] },
  inactive_users: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

AdminSchema.pre("save", async function (next) {
  const users = await User.find();
  this.players = users;
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
