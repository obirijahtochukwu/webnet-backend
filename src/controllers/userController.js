const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

const secret = "secret123";

const getUser = async (req, res) => {
  if (typeof req.params.token !== "string" || req.params.token == "null") {
    return res.json({});
  } else {
    if (req.params.token == "admin") {
      const adminData = await Admin.findOne({});

      if (!adminData) {
        return res.status(404).json({ message: "Admin data not found" });
      }
      const adminInfo = adminData.toObject({ virtuals: true });
      return res.json({
        ...adminInfo,
        name: "John Carter",
        email: "obirijah@gmail.com",
        token: "admin",
      });
    }
    console.log(typeof req.params.token);
    console.log(req.params.token);

    try {
      const payload = jwt.verify(req.params.token, secret);
      const userInfo = await User.findById(payload.id);

      if (!userInfo) return res.json({});
      console.log(userInfo);

      res.json(userInfo);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
};

module.exports = { getUser };
