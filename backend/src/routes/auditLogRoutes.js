const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const auditLogController = require("../controllers/auditLogController");
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  auditLogController.getAuditLogs,
);

module.exports = router
