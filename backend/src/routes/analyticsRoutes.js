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
router.get(
  "/high-risk-assets",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getHighRiskAssets,
);
router.get(
  "/assets-by-department",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getAssetsByDepartmentController,
);
router.get(
  "/assets-by-category",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getAssetsByCategoryController,
);
router.get(
  "/maintenance-summary",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getMaintenanceSummaryController,
);

module.exports = router;
