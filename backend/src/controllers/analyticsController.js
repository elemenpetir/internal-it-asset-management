const {
  getAssetOverview,
  getRiskScoreData,
  getAllRiskScoreData,
  calculateRiskScore,
} = require("../models/analyticsModel");

const getOverview = async (req, res, next) => {
  try {
    const rows = await getAssetOverview();

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

const getAssetRiskScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assetData = await getRiskScoreData(id);

    if (!assetData) {
      return res
        .status(404)
        .json({ status: "failed", message: "Asset not found" });
    }

    const { risk_score, risk_level } = calculateRiskScore(assetData);

    return res.status(200).json({
      status: "success",
      message: "get asset risk score successfully",
      data: {
        asset_id: assetData.id,
        asset_code: assetData.asset_code,
        asset_name: assetData.name,
        status: assetData.status,
        maintenance_count: Number(assetData.maintenance_count),
        assignment_count: Number(assetData.assignment_count),
        risk_score,
        risk_level,
        recommendation:
          risk_level === "high"
            ? "candidate for maintenance or replacement review"
            : risk_level === "medium"
              ? "monitor regularly"
              : "no action needed",
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHighRiskAssets = async (req, res, next) => {
  try {
    const allAssets = await getAllRiskScoreData();

    const highRisk = allAssets
      .map((asset) => {
        const { risk_score, risk_level } = calculateRiskScore(asset);
        return {
          asset_id: asset.id,
          asset_code: asset.asset_code,
          asset_name: asset.name,
          status: asset.status,
          risk_score,
          risk_level,
          recommendation: "candidate for maintenance or replacement review",
        };
      })
      .filter((asset) => asset.risk_level === "high")
      .sort((a, b) => b.risk_score - a.risk_score);

    return res.status(200).json({
      status: "success",
      message: "get high risk assets successfully",
      data: highRisk,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getAssetRiskScore,
  getHighRiskAssets,
};
