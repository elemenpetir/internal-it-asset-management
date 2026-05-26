const express = require("express");
const router = express.Router();
const assetAssignmentController = require("../controllers/assetAssignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, assetAssignmentController.getAssetAssignments);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  assetAssignmentController.createAssetAssignment,
);
router.patch('/:id/return', authMiddleware, roleMiddleware('asset_admin', 'manager'), assetAssignmentController.returnAssetAssignment)

module.exports = router