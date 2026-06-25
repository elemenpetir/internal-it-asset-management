const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, departmentController.getDepartments);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin"),
  departmentController.createDepartment,
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("asset_admin"),
  departmentController.updateDepartment,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("asset_admin"),
  departmentController.deleteDepartment,
);

module.exports = router;
