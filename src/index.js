const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("./models/user.js");
const secret = "secret123";

const URL = "mongodb://localhost:27017";
mongoose
  .connect(URL)
  .then(() => {
    console.log("database jconneted");
  })
  .catch((err) => console.log(err));

const port = 5000;
const app = express();
app.use(cookieParser());
app.use(bodyParser.send({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PATCH, DELETE",
    credentials: true,
  }),
);
app.use("/image", express.static("image"));

app.get("/user", (req, res) => {
  if (!req.cookies.token) {
    return res.send({});
  }
  const payload = jwt.verify(req.cookies.token, secret);
  User.findById(payload.id).then((userInfo) => {
    if (!userInfo) {
      return res.send({});
    }
    res.send(userInfo);
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send({ message: "user already exists", user: existingUser });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });

    const savedUser = await newUser.save();

    const token = await jwt.sign({ id: savedUser._id, email, name: savedUser.name }, secret);

    res.cookie("token", token).send({
      id: savedUser._id,
      email,
      name: savedUser.name,
      cart: savedUser.cart, // Assuming cart is an empty array or initialized elsewhere
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((userInfo) => {
    if (!userInfo) {
      return res.sendStatus(401);
    }
    const passOk = bcrypt.compareSync(password, userInfo.password);
    if (passOk) {
      jwt.sign({ id: userInfo._id, email }, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.cookie("token", token).send({
            id: userInfo._id,
            email: userInfo.email,
            cart: userInfo.cart,
          });
        }
      });
    } else {
      res.sendStatus(401);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").send();
});

app.get("/", (req, res) => {
  res.send("Hello Worldj!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
