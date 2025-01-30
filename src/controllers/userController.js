const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");
const Token = require("../models/claim-token");
const { getPlayer } = require("../helpers");

const secret = "secret123";

const getUser = async (req, res) => {
  if (typeof req.params.token !== "string" || req.params.token == "null") {
    return res.json({});
  } else {
    try {
      if (req.params.token == "admin") {
        const adminData = await Admin.findOne({});
        const users = await User.find();

        if (!adminData) {
          return res.status(404).json({ message: "Admin data not found" });
        }
        const adminInfo = adminData.toObject({ virtuals: true });
        return res.json({
          ...adminInfo,
          players: users,
          name: "John Carter",
          email: "obirijah@gmail.com",
          token: "admin",
        });
      } else {
        console.log("req.params.token");

        const payload = jwt.verify(req.params.token, secret);
        const userInfo = await User.findById(payload.id);
        const ho = userInfo.toObject({ virtuals: true });
        if (!userInfo) return res.json({});
        const player_deatils = await getPlayer(payload.id);

        res.json({ ...player_deatils, ...ho });
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
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = new Token({
      amount,
      name,
      userId,
      email,
      status,
    });

    await token.save();
    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const editUser = async (req, res) => {
  const { name, email, profileImage, language, date_of_birth, userId } = req.body;

  try {
    const user = await User.findById(userId);

    user.name = name;
    user.email = email;
    user.date_of_birth = date_of_birth;
    user.profileImage = profileImage;

    await user.save();
    res.json(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getUser, claimToken, editUser };
