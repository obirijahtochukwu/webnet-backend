const { ObjectId } = require("mongoose");
const { default: mongoose } = require("mongoose");
const GameHistory = require("./models/game-history");
const User = require("./models/user");
const { months } = require("./utils");
const Admin = require("./models/admin");

const calculateTotalPayouts = (gameHistoryArray) => {
  if (!gameHistoryArray || !Array.isArray(gameHistoryArray)) {
    throw new Error("Invalid input: Please provide an array of GameHistory documents.");
  }

  const totalPayouts = gameHistoryArray.reduce((acc, gameHistory) => {
    if (gameHistory.result === "win" && typeof gameHistory.payout === "number" && !isNaN(gameHistory.payout)) {
      return acc + gameHistory.payout;
    } else {
      return acc;
    }
  }, 0);

  return totalPayouts;
};

const getNewSignups = async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the current month

  // Count documents created since the start of the month
  const thisMonthSignups = await User.countDocuments({
    createdAt: { $gte: startOfMonth },
  });
  console.log(thisMonthSignups);

  return thisMonthSignups;
};

const calculateAdminProfit = async () => {
  const profit = await GameHistory.aggregate([
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
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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

  return profit;
};

const getTop3Games = async () => {
  const topGames = await GameHistory.aggregate([
    {
      $group: {
        _id: "$game", // Group by game name
        count: { $sum: 1 }, // Count occurrences of each game
      },
    },
    {
      $sort: { count: -1 }, // Sort by count in descending order
    },
    {
      $limit: 3, // Limit to top 3
    },
    {
      $project: {
        // Optional: Only include game name and count
        _id: 0, // Exclude _id
        game: "$_id", // Rename _id to game
        count: 1,
      },
    },
  ]);

  return topGames;
};

const calculateTopPlayers = async () => {
  const limit = 3;

  const topPlayers = await GameHistory.aggregate([
    {
      $group: {
        _id: "$userId",
        username: { $first: "$username" },
        totalBets: { $sum: "$betAmount" },
        betCount: { $count: {} },
      },
    },
    {
      $sort: { totalBets: -1 },
    },
    {
      $limit: limit,
    },
    {
      // Lookup user details (including email)
      $lookup: {
        from: "users", // Name of your User collection (important!)
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      // Unwind the userDetails array (since it's an array of 1)
      $unwind: "$userDetails",
    },
    {
      // Project the desired fields
      $project: {
        _id: 1, // Include _id (userId)
        username: 1,
        totalBets: 1,
        betCount: 1,
        email: "$userDetails.email", // Access email from userDetails
        profileImage: "$userDetails.profileImage", // Access email from userDetails
      },
    },
  ]);

  return topPlayers;
};

const userGrowth = async () => {
  const users = await User.aggregate([
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
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
  const betCount = gameHistory.length;
  const amount = gameHistory.reduce((acc, item) => acc + item.betAmount, 0) / betCount;
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
        session: { $count: {} },
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
          $cond: [{ $eq: ["$totalPlays", 0] }, 0, { $multiply: [{ $divide: ["$winCount", "$totalPlays"] }, 100] }],
        },
        lossRate: {
          $cond: [{ $eq: ["$totalPlays", 0] }, 0, { $multiply: [{ $divide: ["$lossCount", "$totalPlays"] }, 100] }],
        },
        activePlayers: { $size: "$uniquePlayers" }, // Count of unique players
        session: 1,
      },
    },
  ]);

  return stats;
};

const getInactiveUsers = async () => {
  const userWithplays = await GameHistory.distinct("userId");
  const userWithOutplays = await User.find({ _id: { $nin: userWithplays } });
  return userWithOutplays.length;
};

const calculatePlayerLoss = async (userId) => {
  const loss = await GameHistory.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), result: "loss" }, //
    },
    {
      $group: {
        _id: "$userId",
        loss: { $sum: "$betAmount" },
      },
    },
  ]);

  return loss[0]?.loss || 0;
};

const getTermsOfServices = async (req, res) => {
  try {
    const admin = await Admin.findOne({});
    res.status(201).send({
      terms_of_service: admin.terms_of_service,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPlayer = async (userId) => {
  const stats = await GameHistory.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
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
                    $multiply: [{ $divide: ["$lossCount", "$totalPlays"] }, 100],
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
  const totalLoss = await calculatePlayerLoss(userId);

  const averageBet = stats[0].averageBet[0]?.averageBet || 0;
  const totalProfit = stats[0].totalProfit[0]?.totalProfit || 0;
  const totalPlays = stats[0].totalPlays[0]?.totalPlays || 0;
  const totalSession = stats[0].totalSession[0]?.session || 0;

  const user = await User.findById(userId);
  const userInfo = user.toObject({ virtuals: true });

  return {
    ...userInfo,
    totalLoss,
    averageBet,
    totalProfit,
    totalPlays,
    totalSession,
    games: stats[0].games,
  };
};

const getMonthlyUsers = async () => {
  const monthlyUsers = await GameHistory.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" }, // Extract year from createdAt
          month: { $month: "$createdAt" }, // Extract month from createdAt
        },
        uniqueUsers: { $addToSet: "$userId" }, // Collect unique user IDs for each month
      },
    },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        totalUsers: { $size: "$uniqueUsers" }, // Count unique users for each month
      },
    },
    {
      $group: {
        _id: null,
        totalMonths: { $sum: 1 }, // Count the number of months
        totalUsers: { $sum: "$totalUsers" }, // Sum users across all months
      },
    },
    {
      $project: {
        _id: 0,
        averageUsers: { $divide: ["$totalUsers", "$totalMonths"] }, // Calculate average
      },
    },
  ]);
  console.log(monthlyUsers);

  // If no data is found, return 0
  const averageUsers = monthlyUsers.length > 0 ? monthlyUsers[0].averageUsers : 0;
  return averageUsers;
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
  calculateTopPlayers,
  getNewSignups,
  getTop3Games,
  getTermsOfServices,
  getMonthlyUsers,
};
