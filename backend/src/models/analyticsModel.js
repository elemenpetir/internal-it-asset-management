const db = require("../config/db");

const getAssetOverview = async () => {
  const sql = `SELECT status, COUNT(*) as total FROM assets GROUP BY status`;
  const [rows] = await db.query(sql);
  return rows;
};

module.exports = {
  getAssetOverview,
};
