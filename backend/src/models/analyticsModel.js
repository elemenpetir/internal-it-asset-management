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

const calculateRiskScore = (assetData) => {
  const { purchase_date, maintenance_count, status, assignment_count } =
    assetData;

  const purchaseDate = new Date(purchase_date);
  const now = new Date();
  const ageInYears = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365);

  let age_score;
  if (ageInYears < 2) age_score = 5;
  else if (ageInYears <= 4) age_score = 15;
  else age_score = 30;

  let maintenance_score;
  if (maintenance_count === 0) maintenance_score = 0;
  else if (maintenance_count <= 2) maintenance_score = 15;
  else maintenance_score = 30;

  let status_score;
  if (status === "available" || status === "assigned") status_score = 0;
  else if (status === "under_maintenance") status_score = 20;
  else status_score = 40; // retired

  let assignment_score;
  if (assignment_count <= 2) assignment_score = 5;
  else if (assignment_count <= 5) assignment_score = 10;
  else assignment_score = 15;

  const risk_score =
    age_score + maintenance_score + status_score + assignment_score;

  let risk_level;
  if (risk_score <= 30) risk_level = "low";
  else if (risk_score <= 60) risk_level = "medium";
  else risk_level = "high";

  return { risk_score, risk_level };
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
  calculateRiskScore,
  getAssetsByDepartment,
  getAssetsByCategory,
  getMaintenanceSummary,
};
