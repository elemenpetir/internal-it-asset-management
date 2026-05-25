const db = require("../config/db");

const getAssetAssignments = async () => {
  const sql = `SELECT 
        asset_assignments.id,
        asset_assignments.asset_id,
        assets.asset_code,
        assets.name AS asset_name,
        asset_assignments.employee_id,
        employees.name AS employee_name,
        asset_assignments.assigned_by,
        users.name AS assigned_by_name,
        asset_assignments.assigned_at,
        asset_assignments.returned_at,
        asset_assignments.status,
        asset_assignments.notes,
        asset_assignments.created_at,
        asset_assignments.updated_at
    FROM asset_assignments
    JOIN assets ON asset_assignments.asset_id = assets.id
    JOIN employees ON asset_assignments.employee_id = employees.id
    JOIN users ON asset_assignments.assigned_by = users.id
    ORDER BY asset_assignments.id DESC`;

    const [rows] = await db.query(sql)
    return rows
};

const createAssetAssignment = async (data) => {
  const sql = `INSERT INTO asset_assignments
    (asset_id, employee_id, assigned_by, notes) VALUES (?, ?, ?, ?)`;
  const values = [
    data.asset_id,
    data.employee_id,
    data.assigned_by,
    data.notes || null,
  ];
  const [result] = await db.query(sql, values);
  return result;
};

module.exports = {
  getAssetAssignments,
  createAssetAssignment,
};
