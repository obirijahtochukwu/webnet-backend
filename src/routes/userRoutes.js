const express = require("express");
const { getUser, claimToken, editUser, getAds, getGameStats } = require("../controllers/userController");
const { getGames, addGame, placeSportBet, updateBetOnMatchEnd } = require("../controllers/gameHistoryController");
const { plinko } = require("../controllers/plinko");
const { approveToken, deleteUser } = require("../controllers/adminController");
const { getTermsOfServices } = require("../helpers");
const { upload } = require("../middleware/upload-file");

const router = express.Router();

router.get("/user/:token", getUser);
router.get("/game-history", getGames);
router.post("/add-game", addGame);
router.post("/place-sport-bet", placeSportBet);
router.put("/update-bet-on-match-end", updateBetOnMatchEnd);
router.post("/plinko", plinko);
router.post("/claim-token", claimToken);
router.put("/edit", upload.single("profileImage"), editUser);
router.get("/terms_of_service", getTermsOfServices);
router.get("/get-ads", getAds);
router.get("/game-stats", getGameStats);

module.exports = router;
