const User = require("../models/user");
const Admin = require("../models/admin");
const GameHistory = require("../models/game-history");

const getGames = async (req, res) => {
  try {
    const games = await GameHistory.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addGame = async (req, res) => {
  const { game, result, betAmount, multiplier, time, payout } = req.body;
  try {
    const user = await User.findById(req.body.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (isNaN(user.balance)) {
      user.balance = 100;
    }

    const gameHistory = new GameHistory({
      userId: req.body.userId,
      username: user.name,
      game,
      result,
      betAmount,
      multiplier,
      time,
      payout,
    });

    if (result === "win") {
      user.balance += betAmount;
      const admin = await Admin.updateMany({}, { $inc: { total_payouts: payout } });
    }
    if (result === "loss") {
      user.balance -= betAmount;
      const admin = await Admin.updateMany({}, { $inc: { profit: betAmount } });
    }
    const admin = await Admin.updateMany({}, { $inc: { total_players_session: 1 } });

    await user.save();
    await gameHistory.save();

    res.status(201).json(gameHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGames, addGame };
