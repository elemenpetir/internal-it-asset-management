const assetCategoryModel = require("../models/assetCategoryModel");

const getAssetCategories = async (req, res, next) => {
  try {
    const rows = await assetCategoryModel.getAssetCategories();
    res.status(200).json({
      status: "success",
      message: "get all data asset categories",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const createAssetCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "failed",
        message: "name is required",
      });
    }

    const result = await assetCategoryModel.createAssetCategory(name);
    res.status(201).json({
      status: "success",
      message: "add data asset category success",
      data: {
        id: result.insertId,
        name: name,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssetCategories,
  createAssetCategory,
};
