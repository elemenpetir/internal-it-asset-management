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

const getAllRiskScoreData = async () => {
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
    WHERE assets.status != 'retired'
    GROUP BY assets.id`;
  const [rows] = await db.query(sql);
  return rows;
};

const getAssetsByDepartment = async () => {
  const sql = `
    SELECT 
      departments.id,
      departments.name AS department_name,
      COUNT(DISTINCT asset_assignments.asset_id) AS total_assets
    FROM departments
    LEFT JOIN employees ON employees.department_id = departments.id
    LEFT JOIN asset_assignments ON asset_assignments.employee_id = employees.id
      AND asset_assignments.status = 'active'
    GROUP BY departments.id, departments.name
    ORDER BY total_assets DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};

const getAssetsByCategory = async () => {
  const sql = `
    SELECT 
      asset_categories.id,
      asset_categories.name AS category_name,
      COUNT(assets.id) AS total_assets
    FROM asset_categories
    LEFT JOIN assets ON assets.category_id = asset_categories.id
      AND assets.status != 'retired'
    GROUP BY asset_categories.id, asset_categories.name
    ORDER BY total_assets DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};

const getMaintenanceSummary = async () => {
  const sql = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS total,
      SUM(status = 'completed') AS completed,
      SUM(status = 'canceled') AS canceled,
      SUM(status IN ('reported', 'in_progress')) AS ongoing
    FROM maintenance_requests
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 6
  `;
  const [rows] = await db.query(sql);
  return rows;
};

module.exports = {
  getAssetOverview,
  getRiskScoreData,
  getAllRiskScoreData,
  getAssetsByDepartment,
  getAssetsByCategory,
  getMaintenanceSummary,
};
