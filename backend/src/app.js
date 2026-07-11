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
const analyticsRoutes = require("./routes/analyticsRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // origin bisa undefined kalau request datang dari tools seperti Postman/curl
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/analytics", analyticsRoutes);
app.use("/api/departments", departmentRoutes);
app.use(errorMiddleware);

module.exports = app;