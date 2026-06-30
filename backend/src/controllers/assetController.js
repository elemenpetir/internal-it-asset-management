const assetModel = require("../models/assetModel");
const assetAssignmentModel = require("../models/assetAssignmentModel");

const getAssets = async (req, res, next) => {
  try {
    const { status, category_id } = req.query;
    const rows = await assetModel.getAssets({ status, category_id });
    return res.status(200).json({
      status: "success",
      message: "get all data successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await assetModel.getAssetById(id);
    if (!rows) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "get data succesfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentsByAssetId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await assetAssignmentModel.getAssignmentsByAssetId(id);
    res.status(200).json({
      status: "success",
      message: "get assignments by asset id",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const {
      asset_code,
      name,
      category_id,
      brand,
      model,
      serial_number,
      purchase_date,
      location,
      notes,
    } = req.body;

    if (
      !asset_code ||
      !name ||
      !category_id ||
      !brand ||
      !model ||
      !serial_number ||
      !purchase_date ||
      !location
    ) {
      return res.status(400).json({
        status: "failed",
        message:
          "asset_code, name, category_id, brand, model, serial_number, purchase_date, location are required",
      });
    }

    const result = await assetModel.createAssetWithAuditLog({
      asset_code,
      name,
      category_id,
      brand,
      model,
      serial_number,
      purchase_date,
      location,
      notes,
      changed_by: req.user.id,
    });

    return res.status(201).json({
      status: "success",
      message: "asset created successfully",
      data: {
        id: result.insertId,
        asset_code,
        name,
        category_id,
        brand,
        model,
        serial_number,
        purchase_date,
        location,
        notes: notes || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      asset_code,
      name,
      category_id,
      brand,
      model,
      serial_number,
      purchase_date,
      location,
      notes,
    } = req.body;

    if (
      !asset_code ||
      !name ||
      !category_id ||
      !brand ||
      !model ||
      !serial_number ||
      !purchase_date ||
      !location
    ) {
      return res.status(400).json({
        status: "failed",
        message:
          "asset_code, name, category_id, brand, model, serial_number, purchase_date, and location are required",
      });
    }

    const result = await assetModel.updateAssetWithAuditLog(id, {
      asset_code,
      name,
      category_id,
      brand,
      model,
      serial_number,
      purchase_date,
      location,
      notes,
      changed_by: req.user.id,
    });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "update asset successfully",
      data: {
        id: Number(id),
        asset_code,
        name,
        category_id,
        brand,
        model,
        serial_number,
        purchase_date,
        location,
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "failed",
        message: "status is required",
      });
    }

    const validateStatus = [
      "available",
      "assigned",
      "under_maintenance",
      "retired",
    ];
    if (!validateStatus.includes(status)) {
      return res.status(400).json({
        status: "failed",
        message:
          "status must be one of: available, assigned, under_maintenance, retired",
      });
    }

    const result = await assetModel.updateAssetStatusWithAuditLog(
      id,
      status,
      req.user.id,
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "update status successfully",
      data: {
        id: Number(id),
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  getAssignmentsByAssetId,
  createAsset,
  updateAsset,
  updateStatus,
};
