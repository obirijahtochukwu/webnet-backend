const express = require("express");
const { getUser, claimToken, editUser } = require("../controllers/userController");
const { getGames, addGame } = require("../controllers/gameHistoryController");
const { plinko } = require("../controllers/plinko");
const { approveToken, deleteUser } = require("../controllers/adminController");
const { getTermsOfServices } = require("../helpers");
const upload = require("../middleware/upload-file");

const router = express.Router();

router.get("/user/:token", getUser);
router.get("/game-history", getGames);
router.post("/add-game", addGame);
router.post("/plinko", plinko);
router.post("/claim-token", claimToken);
router.put("/edit", upload.single("profileImage"), editUser);
router.get("/terms_of_service", getTermsOfServices);

module.exports = router;
