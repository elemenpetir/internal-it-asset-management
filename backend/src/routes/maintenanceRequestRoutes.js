const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const maintenanceRequestController = require("../controllers/maintenanceRequestController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  maintenanceRequestController.getAllMaintenanceRequests,
);
router.get(
  "/my-requests",
  authMiddleware,
  roleMiddleware("employee"),
  maintenanceRequestController.getMyMaintenanceRequest,
);
router.post(
  "/my-assets",
  authMiddleware,
  roleMiddleware("employee", "asset_admin"),
  maintenanceRequestController.getMyActiveAssets,
);
router.get(
  "/:id/detail",
  authMiddleware,
  maintenanceRequestController.getMaintenanceRequestById,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("employee", "asset_admin"),
  maintenanceRequestController.createMaintenanceRequest,
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("asset_admin"),
  maintenanceRequestController.updateMaintenanceRequestStatus,
);

module.exports = router;
