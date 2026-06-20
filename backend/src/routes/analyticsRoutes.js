const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get(
  "/overview",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getOverview,
);

module.exports = router
