const User = require("../models/user");
const Admin = require("../models/admin");
const GameHistory = require("../models/game-history");
const {
  calculateTotalPayouts,
  userGrowth,
  calculateAverageBetSize,
  calculatePlayersWinRate,
  calculatePlayersSessions,
  calculateGameSportStart,
  getInactiveUsers,
  getPlayer,
} = require("../helpers");

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
    const winRate = await getPlayer("67560932a569bcfe5a2eaaf8");
    console.log(winRate);

    // adminData.inactive_users = winRate.length;
    // await adminData.save();
    res.status(200).json(winRate);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
};

const getPlayerData = async (req, res) => {
  try {
    const player_deatils = await getPlayer("67560932a569bcfe5a2eaaf8");

    res.status(200).json(player_deatils);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
};

module.exports = { addPageView, getAdminData, getNewSignups, getPlayerData };
