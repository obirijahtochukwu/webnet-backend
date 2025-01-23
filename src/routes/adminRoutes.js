const express = require("express");
const {
  getNewSignups,
  addPageView,
  getAdminData,
  getPlayerData,
} = require("../controllers/adminController");

const router = express.Router();

router.put("/add_page_view", addPageView);
router.get("/new_signups", getNewSignups);
router.get("/admin-data", getAdminData);
router.get("/admin/player/:id", getPlayerData);

module.exports = router;
