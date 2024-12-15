const User = require("../models/user");
const GameHistory = require("../models/game-history");

const getGames = async (req, res) => {
  try {
    const games = await GameHistory.find({ userId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addGame = async (req, res) => {
  if (!req.cookies.token) return res.json({});

  const { game, result, betAmount, multiplier, time, payout } = req.body;
  try {
    const user = await User.findById(req.body.userId);
    console.log(user);

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

    if (result === "win") user.balance += betAmount;
    if (result === "loss") user.balance -= betAmount;

    await user.save();
    await gameHistory.save();

    res.status(201).json(gameHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGames, addGame };
