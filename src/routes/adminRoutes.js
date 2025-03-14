const express = require("express");
const { upload } = require("../middleware/upload-file");
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
  deleteAd,
} = require("../controllers/adminController");

const router = express.Router();

router.put("/add_page_view", addPageView);
router.get("/new_signups", getNewSignups);
router.get("/admin-data", getAdminData);
router.get("/order-list", orderList);
router.get("/admin/player/:id", getPlayerData);
router.put("/approve-token", approveToken);
router.put("/gift-token", giftToken);
router.post("/create-ad", upload.single("image"), createAd);
router.put("/update-terms-of-ervices", updateTermsOfServices);
router.delete("/delete-user/:id", deleteUser);
router.delete("/delete-ad/:id", deleteAd);

module.exports = router;
