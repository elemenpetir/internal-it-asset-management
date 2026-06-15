const express = require("express");
const app = express();
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const assetCategoryRoutes = require("./routes/assetCategoryRoutes");
const assetRoutes = require("./routes/assetRoutes");
const assetAssignmentRoutes = require("./routes/assetAssignmentRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const maintenanceRequestRoutes = require("./routes/maintenanceRequestRoutes");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/asset-categories", assetCategoryRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/asset-assignments", assetAssignmentRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/maintenance-requests", maintenanceRequestRoutes);
app.use(errorMiddleware);

module.exports = app;
