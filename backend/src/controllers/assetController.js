const assetModel = require("../models/assetModel");

const getAssets = async (req, res, next) => {
  try {
    const rows = await assetModel.getAssets();
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

    const result = await assetModel.createAsset({
      asset_code,
      name,
      category_id,
      brand,
      model,
      serial_number,
      purchase_date,
      location,
      notes,
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

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
};
