const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");
const Token = require("../models/claim-token");
const GameHistory = require("../models/game-history");
const Ad = require("../models/ads");
const { uploadToCloudinary } = require("../middleware/upload-file");

const {
  getPlayer,
  getInactiveUsers,
  calculateTopPlayers,
  getNewSignups,
  userGrowth,
  calculateGameSportStart,
  calculateAverageBetSize,
  calculatePlayersWinRate,
  getTop3Games,
  calculateAdminProfit,
  getMonthlyUsers,
} = require("../helpers");

const secret = "secret123";

const getUser = async (req, res) => {
  if (typeof req.params.token !== "string" || req.params.token == "null") {
    return res.send({});
  } else {
    try {
      if (req.params.token == "admin") {
        const adminData = await Admin.findOne({});
        const gameHistory = await GameHistory.find();
        const users = await User.find();
        const inactive_users = await getInactiveUsers();
        const topPlayers = await calculateTopPlayers();

        const new_signups = await getNewSignups();
        const monthly_users = await getMonthlyUsers();
        console.log("monthly_users");
        console.log(monthly_users);
        const user_growth = await userGrowth();
        const game_and_sport_stats = await calculateGameSportStart();
        const average_bet_size = calculateAverageBetSize(gameHistory);
        const players_win_rate = calculatePlayersWinRate(gameHistory);
        const monthly_profit = await calculateAdminProfit();
        const topGames = await getTop3Games();

        if (!adminData) {
          return res.status(404).send({ message: "Admin data not found" });
        }
        const adminInfo = adminData.toObject({ virtuals: true });
        return res.send({
          ...adminInfo,
          players: users,
          name: "John Carter",
          email: "obirijah@gmail.com",
          token: "admin",
          average_bet_size,
          game_and_sport_stats,
          inactive_users,
          monthly_profit,
          new_signups,
          topGames,
          topPlayers,
          players_win_rate,
          // players: topPlayers,
          user_growth,
          monthly_users,
        });
      } else {
        const payload = jwt.verify(req.params.token, secret);
        const user = await User.findById(payload.id);
        const userInfo = user.toObject({ virtuals: true });
        if (!userInfo) return res.send({});
        const player_deatils = await getPlayer(payload.id);

        res.send({ ...player_deatils, ...userInfo });
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
};

const claimToken = async (req, res) => {
  const { amount, userId, email, status, name } = req.body;
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).send({ error: "User not found" });

    const token = new Token({
      amount,
      name,
      userId,
      email,
      status,
    });

    await token.save();
    res.status(201).send(token);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log(error);
  }
};

const editUser = async (req, res) => {
  const { name, email, date_of_birth, userId } = req.body;
  const profileImage = req.file;
  try {
    let cloudinaryUrl = null;

    if (profileImage?.path) {
      try {
        cloudinaryUrl = await uploadToCloudinary(profileImage.path);

        const fs = require("fs");
        fs.unlinkSync(profileImage.path);
      } catch (err) {
        return res.status(500).send("Error uploading to Cloudinary.");
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.name = name;
    user.email = email;
    user.date_of_birth = date_of_birth;
    if (profileImage) user.profileImage = cloudinaryUrl;

    await user.save();
    res.send(user);
  } catch (error) {
    console.error("Error in editUser:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getAds = async (req, res) => {
  try {
    const ads = await Ad.find({});
    res.send(ads);
    console.log("ads");
    console.log(ads);
  } catch (error) {
    console.log(error);
    console.log("error");
  }
};

module.exports = { getUser, claimToken, editUser, getAds };
