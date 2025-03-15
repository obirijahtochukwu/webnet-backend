const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

const signup = async (req, res) => {
  try {
    const { name, email, password, language, date_of_birth } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      language,
      date_of_birth,
      profileImage:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzfChb0sWhvAL9PUI87tXjijFzMvyWic01nXPGCeu6DI3K2OdXOACu09gXd0WGcHYIEc8&usqp=CAU",
    });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id, email, name }, process.env.JWT_SECRET);

    res.cookie("token", token).send({
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
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.cookie("token", password).send({
      email,
      token: password,
    });
    console.log(req.body);
  } else {
    const userInfo = await User.findOne({ email });

    if (!userInfo) return res.sendStatus(401);

    const passOk = bcrypt.compareSync(password, userInfo.password);
    if (passOk) {
      const token = jwt.sign({ id: userInfo._id, email }, process.env.JWT_SECRET);
      res.cookie("token", token).send({
        id: userInfo._id,
        email,
        token,
      });
    } else {
      res.sendStatus(401);
    }
  }
};

const adminSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.send({ message: "Admin already exists", Admin: existingAdmin });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      name,
      role,
    });
    const savedAdmin = await newAdmin.save();

    const token = jwt.sign({ id: savedAdmin._id, email, name }, process.env.JWT_SECRET);

    res.cookie("token", token).send({
      id: savedAdmin._id,
      email,
      name,
      role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const logout = (req, res) => {
  res.cookie("token", "").send();
};

module.exports = { signup, login, logout, adminSignup };
