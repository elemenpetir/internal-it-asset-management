const express = require("express");
const router = express.Router();
const assetAssignmentController = require("../controllers/assetAssignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetAssignmentController.getAssetAssignments,
);
router.get(
  "/my-assignments",
  authMiddleware,
  roleMiddleware("employee"),
  assetAssignmentController.getMyAssignments,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetAssignmentController.createAssetAssignment,
);
router.patch(
  "/:id/return",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetAssignmentController.returnAssetAssignment,
);
router.get(
  "/:id",
  authMiddleware,
  assetAssignmentController.getAssetAssignmentById,
);

module.exports = router;
