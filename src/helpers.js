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

module.exports = { calculateTotalPayouts, calculateAdminProfit };
