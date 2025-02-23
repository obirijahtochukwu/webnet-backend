const User = require("../models/user");
const Admin = require("../models/admin");
const GameHistory = require("../models/game-history");
const Token = require("../models/claim-token");
const Ad = require("../models/ads");
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

    res.json({ count: thisWeekSignups });
  } catch (error) {
    res.send({ success: false, message: "Failed to calculate signups." });
  }
};

const addPageView = async (req, res) => {
  try {
    let admin = await Admin.updateMany({}, { $inc: { page_views: 1 } });

    res.status(200).send({
      message: "Page views updated successfully",
    });
  } catch (error) {
    console.error("Error updating page views:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

const getAdminData = async (req, res) => {
  try {
    const gameHistory = await GameHistory.find({});
    const adminData = await Admin.findOne({});
    // const winRate = await getPlayer("67560932a569bcfe5a2eaaf8");
    // console.log(winRate);

    // // adminData.inactive_users = winRate.length;
    // // await adminData.save();
    // res.status(200).send(winRate);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).send({ error: "Failed to fetch admin data" });
  }
};

const getPlayerData = async (req, res) => {
  try {
    const player_deatils = await getPlayer(req.params.id);

    res.status(200).send(player_deatils);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).send({ error: "Failed to fetch admin data" });
  }
};

const orderList = async (req, res) => {
  try {
    const orders = await Token.find();

    res.send(orders);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const approveToken = async (req, res) => {
  try {
    const token = await Token.findById(req.body._id);
    const user = await User.findById(req.body.userId);
    console.log(req.body.userId);

    token.status = "Approved";
    console.log(user);
    user.balance += token.amount;

    await user.save();
    await token.save();
    res.status(201).send(token);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const giftToken = async (req, res) => {
  const { _id, amount } = req.body;
  try {
    const user = await User.findById(_id);
    user.balance += amount;

    await user.save();
    res.status(201).send({ user, amount });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const deleteUser = async (req, res) => {
  try {
    // Find and delete the user document
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }
    console.log(deletedUser);

    res.send({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error deleting user" });
  }
};

const createAd = async (req, res) => {
  const { title, description } = req.body;
  const image = req.file;
  try {
    const newAd = new Ad({
      image: image.path,
      title,
      description,
    });
    const savedAd = await newAd.save();
    res.send(savedAd);
    console.log(savedAd);
  } catch (error) {
    console.log(error);
  }
};

const updateTermsOfServices = async (req, res) => {
  const { terms } = req.body;
  try {
    const admin = await Admin.updateMany({}, { terms_of_service: terms });
    res.status(201).send({ message: "terms of services updated successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addPageView,
  getAdminData,
  getNewSignups,
  getPlayerData,
  orderList,
  approveToken,
  deleteUser,
  updateTermsOfServices,
  giftToken,
  createAd,
};
