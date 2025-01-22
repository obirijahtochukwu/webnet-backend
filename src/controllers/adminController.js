const User = require("../models/user");
const Admin = require("../models/admin");
const GameHistory = require("../models/game-history");
const { calculateTotalPayouts } = require("../helpers");

const getNewSignups = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const thisWeekSignups = await User.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    res.json(thisWeekSignups);
  } catch (error) {
    console.error("Error calculating signups:", error);
    res.json({ success: false, message: "Failed to calculate signups." });
  }
};

const addPageView = async (req, res) => {
  try {
    let admin = await Admin.findOne();

    const currentPageViews = parseInt(admin.page_views || "0", 10);
    admin.page_views = (currentPageViews + 1).toString();

    await admin.save();
    res.status(200).json({
      message: "Page views updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error updating page views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAdminData = async (req, res) => {
  try {
    const gameHistory = await GameHistory.find({});
    const adminData = await Admin.findOne({});
    const limit = 4; // Optional query parameter for the number of top players to return
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
    adminData.topPlayers = result;
    await adminData.save();
    // res.status(200).json(lossesByDate);
    res.json(result);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
};

module.exports = { addPageView, getAdminData, getNewSignups };
