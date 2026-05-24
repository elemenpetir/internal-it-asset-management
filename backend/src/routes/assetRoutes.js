const assetController = require("../controllers/assetController");
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", authMiddleware, assetController.getAssets);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetController.createAsset,
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetController.updateStatus,
);
router.get("/:id", authMiddleware, assetController.getAssetById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetController.updateAsset,
);

module.exports = router;
