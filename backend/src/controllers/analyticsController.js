const analyticsModel = require("../models/analyticsModel");

const getOverview = async (req, res, next) => {
  try {
    const rows = await analyticsModel.getAssetOverview();

    const overview = {
      total_assets: 0,
      available: 0,
      assigned: 0,
      under_maintenance: 0,
      retired: 0,
    };

    rows.forEach((row) => {
      overview[row.status] = row.total;
      overview.total_assets += row.total;
    });

    return res.status(200).json({
      status: "success",
      message: "get asset overview successfully",
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
