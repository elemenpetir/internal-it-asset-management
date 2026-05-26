const assetAssignmentModel = require("../models/assetAssignmentModel");
const assetModel = require("../models/assetModel");
const employeeModel = require("../models/employeeModel");

const getAssetAssignments = async (req, res, next) => {
  try {
    const rows = await assetAssignmentModel.getAssetAssignments();
    return res.status(200).json({
      status: "success",
      message: "get all data asset assignment successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAssetAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment =
      await assetAssignmentModel.getAssetAssignmentDetailById(id);
    if (!assignment) {
      return res.status(404).json({
        status: "failed",
        message: "assignment not found",
      });
    }
    
    return res.status(200).json({
      status: "success",
      message: "get detail asset assignment successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const createAssetAssignment = async (req, res, next) => {
  try {
    const { asset_id, employee_id, notes } = req.body;
    const assigned_by = req.user.id;

    if (!asset_id || !employee_id) {
      return res.status(400).json({
        status: "failed",
        message: "asset id and employee id are required",
      });
    }

    const asset = await assetModel.getAssetById(asset_id);
    if (!asset) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }

    const employee = await employeeModel.findEmployeeById(employee_id);
    if (!employee) {
      return res.status(404).json({
        status: "failed",
        message: "employee not found",
      });
    }

    if (asset.status !== "available") {
      return res.status(400).json({
        status: "failed",
        message: "asset is not available for assignment",
      });
    }

    const result = await assetAssignmentModel.createAssetAssignment({
      asset_id,
      employee_id,
      assigned_by,
      notes,
    });
    await assetModel.updateStatus(asset_id, "assigned");
    return res.status(201).json({
      status: "success",
      message: "asset assigned successfully",
      data: {
        id: result.insertId,
        asset_id,
        employee_id,
        assigned_by,
        notes: notes || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const returnAssetAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await assetAssignmentModel.getAssetAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({
        status: "failed",
        message: "assignment not found",
      });
    }

    if (assignment.status !== "active") {
      return res.status(400).json({
        status: "failed",
        message: "assignment has already been returned",
      });
    }

    await assetAssignmentModel.returnAssetAssignment(id);
    await assetModel.updateStatus(assignment.asset_id, "available");

    return res.status(200).json({
      status: "success",
      message: "return asset successfully",
      data: {
        id: assignment.id,
        asset_id: assignment.asset_id,
        employee_id: assignment.employee_id,
        status: "returned",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssetAssignments,
  getAssetAssignmentById,
  createAssetAssignment,
  returnAssetAssignment,
};
