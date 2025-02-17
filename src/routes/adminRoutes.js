const express = require("express");
const {
  getNewSignups,
  addPageView,
  getAdminData,
  getPlayerData,
  orderList,
  approveToken,
  deleteUser,
  updateTermsOfServices,
  giftToken,
  createAd,
  getAds,
} = require("../controllers/adminController");

const router = express.Router();

router.put("/add_page_view", addPageView);
router.get("/new_signups", getNewSignups);
router.get("/admin-data", getAdminData);
router.get("/order-list", orderList);
router.get("/admin/player/:id", getPlayerData);
router.get("/get-ads", getAds);
router.put("/approve-token", approveToken);
router.put("/gift-token", giftToken);
router.post("/create-ad", createAd);
router.put("/update-terms-of-ervices", updateTermsOfServices);
router.delete("/delete-user/:id", deleteUser);

module.exports = router;
