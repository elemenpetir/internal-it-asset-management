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
// B9: manager is read-only per PRD — POST/return restricted to asset_admin
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin"),
  assetAssignmentController.createAssetAssignment,
);
router.patch(
  "/:id/return",
  authMiddleware,
  roleMiddleware("asset_admin"),
  assetAssignmentController.returnAssetAssignment,
);
// B5: open to all authenticated roles; ownership checked in controller for employee
router.get(
  "/:id",
  authMiddleware,
  assetAssignmentController.getAssetAssignmentById,
);

module.exports = router;
