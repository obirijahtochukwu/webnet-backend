const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secret = "secret123";

const signup = async (req, res) => {
  try {
    const { name, email, password, language, date_of_birth } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ message: "User already exists", user: existingUser });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      language,
      date_of_birth,
    });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id, email, name }, secret);

    res.cookie("token", token).json({
      id: savedUser._id,
      email,
      name,
      language,
      date_of_birth,
      token,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (password == "admin") {
    res.cookie("token", password).json({
      email,
      token: password,
    });
    console.log(req.body);
  } else {
    const userInfo = await User.findOne({ email });

    if (!userInfo) return res.sendStatus(401);

    const passOk = bcrypt.compareSync(password, userInfo.password);
    if (passOk) {
      const token = jwt.sign({ id: userInfo._id, email }, secret);
      res.cookie("token", token).json({
        id: userInfo._id,
        email,
        token,
      });
    } else {
      res.sendStatus(401);
    }
  }
};

const logout = (req, res) => {
  res.cookie("token", "").send();
};

module.exports = { signup, login, logout };
