const express = require("express");
const { getUser } = require("../controllers/userController");
const { getGames, addGame } = require("../controllers/gameHistoryController");
const { plinko } = require("../controllers/plinko");

const router = express.Router();

router.get("/user/:token", getUser);
router.get("/game-history/:id", getGames);
router.post("/add-game", addGame);
router.post("/plinko", plinko);

module.exports = router;
