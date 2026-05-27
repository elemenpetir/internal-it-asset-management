const auditLogModel = require("../models/auditLogModel");

const getAuditLogs = async (req, res, next) => {
  try {
    const auditLogs = await auditLogModel.getAuditLogs();
    return res.status(200).json({
      status: "success",
      message: "get audit logs successfully",
      data: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
