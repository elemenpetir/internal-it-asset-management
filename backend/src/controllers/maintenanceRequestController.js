const maintenanceRequestModel = require("../models/maintenanceRequestModel");
const employeeModel = require("../models/employeeModel");
const assetAssignmentModel = require("../models/assetAssignmentModel");

const getAllMaintenanceRequests = async (req, res, next) => {
  try {
    const rows = await maintenanceRequestModel.getAllMaintenanceRequest();
    return res.status(200).json({
      status: "success",
      message: "get all data maintenance request successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getMaintenanceRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const maintenanceRequest =
      await maintenanceRequestModel.getMaintenanceRequestById(id);
    if (!maintenanceRequest) {
      return res.status(404).json({
        status: "failed",
        message: "maintenance request not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "get detail maintenance request successfully",
      data: maintenanceRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getMyMaintenanceRequest = async (req, res, next) => {
  try {
    let requested_by;
    const employee = await employeeModel.getEmployeeByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({
        status: "failed",
        message: "employee not found",
      });
    }
    requested_by = employee.id;

    const maintenanceRequest =
      await maintenanceRequestModel.getMaintenanceRequestsByEmployeeId(
        requested_by,
      );
    if (!maintenanceRequest) {
      return res.status(404).json({
        status: "failed",
        message: "maintenance request not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "get data maintenance request successfully",
      data: maintenanceRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getMyActiveAssets = async (req, res, next) => {
  try {
    let employee_id;
    if (req.user.role === "employee") {
      const employee = await employeeModel.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({
          status: "failed",
          message: "employee not found",
        });
      }
      employee_id = employee.id;
    } if (!req.body.employee_number) {
        return res.status(400).json({
          status: "failed",
          message: "employee_number is required",
        });
      }
      const employee = await employeeModel.getEmployeeByEmployeeNumber(
        req.body.employee_number,
      );
      if (!employee) {
        return res.status(404).json({
          status: "failed",
          message: "employee not found",
        });
      }
      employee_id = employee.id;

    const myActiveAssets =
      await assetAssignmentModel.getActiveAssetsByEmployeeId(employee_id);

    if (!myActiveAssets || myActiveAssets.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "my active assets not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "get my active assets successfully",
      data: myActiveAssets,
    });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { asset_id, issue_description } = req.body;
    let requested_by;

    if (req.user.role === "employee") {
      const employee = await employeeModel.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({
          status: "failed",
          message: "employee not found",
        });
      }
      requested_by = employee.id;
    } else if (req.user.role === "asset_admin") {
      if (!req.body.employee_number) {
        return res.status(400).json({
          status: "failed",
          message: "employee_number is required",
        });
      }
      const employee = await employeeModel.getEmployeeByEmployeeNumber(
        req.body.employee_number,
      );
      if (!employee) {
        return res.status(404).json({
          status: "failed",
          message: "employee not found",
        });
      }
      requested_by = employee.id;
    }

    if (!asset_id || !issue_description) {
      return res.status(400).json({
        status: "failed",
        message: "asset id and issue description are required",
      });
    }

    const activeAssignment =
      await assetAssignmentModel.getActiveAssignmentByAssetAndEmployee(
        asset_id,
        requested_by,
      );
    if (!activeAssignment) {
      return res.status(400).json({
        status: "failed",
        message: "asset is not assigned to you",
      });
    }

    const activeRequest =
      await maintenanceRequestModel.getActiveMaintenanceRequestByAssetId(
        asset_id,
      );
    if (activeRequest) {
      return res.status(400).json({
        status: "failed",
        message: "asset already has an active maintenance request",
      });
    }

    const result =
      await maintenanceRequestModel.createMaintenanceRequestWithTransaction({
        asset_id,
        requested_by,
        issue_description,
      });
    return res.status(201).json({
      status: "success",
      message: "maintenance request successfully",
      data: {
        id: result.insertId,
        asset_id,
        requested_by,
        issue_description,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMaintenanceRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const handled_by = req.user.id;
    const statusList = ["in_progress", "completed", "canceled"];

    if (!statusList.includes(status)) {
      return res.status(400).json({
        status: "failed",
        message: "status must be in_progress, completed, or canceled",
      });
    }

    if (status === "completed") {
      if (!resolution_note) {
        return res.status(400).json({
          status: "failed",
          message: "resolution note are required",
        });
      }
    }

    const result =
      await maintenanceRequestModel.updateMaintenanceRequestStatusWithTransaction(
        { status, handled_by, resolution_note, id },
      );

    return res.status(200).json({
      status: "success",
      message: "maintenance request status updated successfully",
      data: {
        id,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  getMyMaintenanceRequest,
  getMyActiveAssets,
  createMaintenanceRequest,
  updateMaintenanceRequestStatus,
};
