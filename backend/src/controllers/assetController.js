const assetModel = require("../models/assetModel");

const getAssets = async (req, res, next) => {
  try {
    const {
      status,
      category_id,
      department_id,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // B12: sanitize pagination — non-numeric/zero/negative values must not
    // reach LIMIT/OFFSET or produce NaN total_pages
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum =
      limit === "all" ? "all" : Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [rows, total] = await Promise.all([
      assetModel.getAssets({
        status,
        category_id,
        department_id,
        search,
        page: pageNum,
        limit: limitNum,
      }),
      assetModel.countAssets({ status, category_id, department_id, search }),
    ]);

    return res.status(200).json({
      status: "success",
      message: "get all data successfully",
      data: rows,
      pagination: {
        total: Number(total),
        page: limitNum === "all" ? 1 : pageNum,
        limit: limitNum === "all" ? Number(total) : limitNum,
        total_pages: limitNum === "all" ? 1 : Math.ceil(total / limitNum),
      },
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

    const existing = await assetModel.getAssetById(id);
    if (!existing) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }

    // B17: identity fields are frozen while the asset is out (assigned) or
    // in repair — changing them would orphan the assignment history
    if (existing.status === "assigned" || existing.status === "under_maintenance") {
      const identityFields = [
        "asset_code",
        "serial_number",
        "category_id",
        "brand",
        "model",
      ];
      const changed = identityFields.filter(
        (f) => req.body[f] !== undefined && String(req.body[f]) !== String(existing[f]),
      );
      if (changed.length > 0) {
        return res.status(400).json({
          status: "failed",
          message: `cannot change ${changed.join(", ")} while asset is ${existing.status}`,
        });
      }
    }

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

    // B1: legal transitions only; assign/return must go through assignment flow
    const allowedTransitions = {
      available: ["under_maintenance", "retired"],
      assigned: ["under_maintenance", "retired"],
      under_maintenance: ["assigned", "available", "retired"],
      retired: [],
    };
    const asset = await assetModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({
        status: "failed",
        message: "asset not found",
      });
    }
    if (!allowedTransitions[asset.status].includes(status)) {
      return res.status(400).json({
        status: "failed",
        message: `cannot change status from ${asset.status} to ${status}`,
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
  createAsset,
  updateAsset,
  updateStatus,
};
