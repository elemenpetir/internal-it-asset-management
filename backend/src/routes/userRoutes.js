const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("asset_admin", "manager"),
  userController.getUsers,
);

module.exports = router;
