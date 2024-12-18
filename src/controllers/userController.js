const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secret = "secret123";

const getUser = async (req, res) => {
  if (!req.params.token) return res.json({});

  try {
    const payload = jwt.verify(req.params.token, secret);
    const userInfo = await User.findById(payload.id);

    if (!userInfo) return res.json({});

    res.json(userInfo);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

module.exports = { getUser };
