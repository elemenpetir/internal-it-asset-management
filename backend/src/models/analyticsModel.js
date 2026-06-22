const db = require("../config/db");

const getAssetOverview = async () => {
  const sql = `SELECT status, COUNT(*) as total FROM assets GROUP BY status`;
  const [rows] = await db.query(sql);
  return rows;
};

const getRiskScoreData = async (id) => {
  const sql = `SELECT 
      assets.id,
      assets.name,
      assets.asset_code,
      assets.status,
      assets.purchase_date,
      COUNT(DISTINCT maintenance_requests.id) AS maintenance_count,
      COUNT(DISTINCT asset_assignments.id) AS assignment_count
    FROM assets
    LEFT JOIN maintenance_requests ON maintenance_requests.asset_id = assets.id
    LEFT JOIN asset_assignments ON asset_assignments.asset_id = assets.id
    WHERE assets.id = ?
    GROUP BY assets.id`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

module.exports = {
  getAssetOverview,
  getRiskScoreData,
};
