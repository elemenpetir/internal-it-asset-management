const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get("/", authMiddleware, assetController.getAssets);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin"),
  assetController.createAsset,
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("asset_admin"),
  assetController.updateStatus,
);
router.get(
  "/:id/assignments",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetController.getAssignmentsByAssetId,
);
router.get("/:id", authMiddleware, assetController.getAssetById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("asset_admin"),
  assetController.updateAsset,
);
router.get(
  "/:id/risk-score",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  analyticsController.getAssetRiskScore,
);

module.exports = router;
