const { ObjectId } = require("mongoose");
const { default: mongoose } = require("mongoose");
const GameHistory = require("./models/game-history");
const User = require("./models/user");

const calculateTotalPayouts = (gameHistoryArray) => {
  if (!gameHistoryArray || !Array.isArray(gameHistoryArray)) {
    throw new Error(
      "Invalid input: Please provide an array of GameHistory documents."
    );
  }

  const totalPayouts = gameHistoryArray.reduce((acc, gameHistory) => {
    if (
      gameHistory.result === "win" &&
      typeof gameHistory.payout === "number" &&
      !isNaN(gameHistory.payout)
    ) {
      return acc + gameHistory.payout;
    } else {
      return acc;
    }
  }, 0);

  return totalPayouts;
};

const calculateAdminProfit = async (GameHistory, Admin) => {
  const lossesByDate = await GameHistory.aggregate([
    {
      $match: { result: "loss" }, // Only include documents where the result is "loss"
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, // Group by month (1 for Jan, 2 for Feb, etc.)
        profit: { $sum: "$betAmount" }, // Sum up the betAmount for losses
      },
    },
    {
      $project: {
        month: {
          $arrayElemAt: [
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            { $subtract: ["$_id", 1] }, // Convert month number to month name
          ],
        },
        profit: 1,
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month number
    },
  ]);

  return lossesByDate;
};

const calculateTopPlayers = async (GameHistory, Admin, User) => {
  const limit = 100;
  const topPlayers = await GameHistory.aggregate([
    {
      $group: {
        _id: "$userId", // Group by userId
        username: { $first: "$username" }, // Retrieve the username
        // totalBets: { $sum: "$betAmount" }, // Sum up the total bet amount
        betCount: { $count: {} }, // Count the number of bets placed
      },
    },
    {
      $sort: { totalBets: -1 }, // Sort players by total bet amount in descending order
    },
    {
      $limit: limit, // Limit the results to the top N players
    },
  ]);

  // Populate email from the User model
  const populatedPlayers = await User.populate(topPlayers, {
    path: "_id", // _id corresponds to userId in the User model
    select: "email", // Only include the email field from the User model
  });

  // Format the response to include both username and email
  const result = populatedPlayers.map((player) => ({
    userId: player._id,
    username: player.username,
    email: player._id.email, // _id contains the user document after population
    totalBets: player.totalBets,
    betCount: player.betCount,
  }));
  return result;
};

const userGrowth = async (Users) => {
  const users = await Users.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: {
          $arrayElemAt: [
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            { $subtract: ["$_id", 1] }, // Convert month number to month name
          ],
        },
        userCount: "$count",
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month number
    },
  ]);

  return users;
};

const calculateAverageBetSize = (gameHistory) => {
  console.log(gameHistory[0]);
  const betCount = gameHistory.length;
  const amount =
    gameHistory.reduce((acc, item) => acc + item.betAmount, 0) / betCount;
  return Math.round(amount);
};

const calculatePlayersWinRate = (gameHistory) => {
  const wins = gameHistory.filter(({ result }) => result == "win").length;
  const rate = (wins / gameHistory.length) * 100;
  return Math.round(rate);
};

const calculatePlayersSessions = (gameHistory) => {
  return Math.round(gameHistory.length);
};

const calculateGameSportStart = async () => {
  const stats = await GameHistory.aggregate([
    {
      $group: {
        _id: "$game", // Group by game
        totalPlays: { $sum: 1 }, // Count the number of times the game was played
        totalPayout: { $sum: "$payout" }, // Sum of payouts
        averageBetSize: { $avg: "$betAmount" }, // Average bet size
        winCount: { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } }, // Count wins
        lossCount: { $sum: { $cond: [{ $eq: ["$result", "loss"] }, 1, 0] } }, // Count losses
        uniquePlayers: { $addToSet: "$userId" }, // Unique players
      },
    },
    {
      $project: {
        game: "$_id",
        _id: 0,
        totalPlays: 1,
        totalPayout: 1,
        averageBetSize: 1,
        winRate: {
          $cond: [
            { $eq: ["$totalPlays", 0] },
            0,
            { $multiply: [{ $divide: ["$winCount", "$totalPlays"] }, 100] },
          ],
        },
        lossRate: {
          $cond: [
            { $eq: ["$totalPlays", 0] },
            0,
            { $multiply: [{ $divide: ["$lossCount", "$totalPlays"] }, 100] },
          ],
        },
        activePlayers: { $size: "$uniquePlayers" }, // Count of unique players
      },
    },
  ]);

  return stats;
};

const getInactiveUsers = async (gameHistory) => {
  const userWithplays = await GameHistory.distinct("userId");
  const userWithOutplays = await User.find({ _id: { $nin: userWithplays } });
  return userWithOutplays;
};

const getPlayer = async (userId) => {
  console.log(GameHistory);

  const stats = await GameHistory.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId("675f06b1bd5a95c05caf81e4"),
      },
    },
    {
      $group: {
        _id: "$game", // Group by game
        totalPlays: { $sum: 1 }, // Count the number of times the game was played
        count: { $sum: 1 },
        profit: { $sum: "$payout" }, // Sum of payouts
        averageBetSize: { $avg: "$betAmount" }, // Average bet size
        winCount: { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } }, // Count wins
        lossCount: { $sum: { $cond: [{ $eq: ["$result", "loss"] }, 1, 0] } }, // Count losses
        uniquePlayers: { $addToSet: "$userId" }, // Unique players
      },
    },
    {
      $facet: {
        games: [
          {
            $project: {
              game: "$_id",
              _id: 0,
              totalPlays: 1,
              profit: 1,
              count: "$count",
              averageBetSize: 1,
              winRate: {
                $cond: [
                  { $eq: ["$totalPlays", 0] },
                  0,
                  {
                    $multiply: [{ $divide: ["$winCount", "$totalPlays"] }, 100],
                  },
                ],
              },
              lossRate: {
                $cond: [
                  { $eq: ["$totalPlays", 0] },
                  0,
                  {
                    $multiply: [
                      { $divide: ["$lossCount", "$totalPlays"] },
                      100,
                    ],
                  },
                ],
              },
            },
          },
        ],
        totalPlays: [
          {
            $group: {
              _id: null,
              totalPlays: { $sum: "$totalPlays" },
            },
          },
        ],
        totalProfit: [
          {
            $group: {
              _id: null,
              totalProfit: { $sum: "$profit" },
            },
          },
        ],
        totalSession: [
          {
            $group: {
              _id: null,
              session: { $sum: "$count" },
            },
          },
        ],
        averageBet: [
          {
            $group: {
              _id: null,
              averageBet: { $avg: "$averageBetSize" },
            },
          },
        ],
      },
    },
  ]);

  const averageBet = stats[0].averageBet[0].averageBet || 0;
  const totalProfit = stats[0].totalProfit[0].totalProfit || 0;
  const totalPlays = stats[0].totalPlays[0].totalPlays || 0;
  const totalSession = stats[0].totalSession[0].session || 0;

  return {
    averageBet,
    totalProfit,
    totalPlays,
    totalSession,
    games: stats[0].games,
  };
};

module.exports = {
  calculateTotalPayouts,
  calculateAdminProfit,
  userGrowth,
  calculateAverageBetSize,
  calculatePlayersWinRate,
  calculatePlayersSessions,
  calculateGameSportStart,
  getInactiveUsers,
  getPlayer,
};
