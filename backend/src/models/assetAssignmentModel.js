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

  const [rows] = await db.query(sql);
  return rows;
};

const getAssetAssignmentById = async (id) => {
  const sql = `SELECT 
      id,
      asset_id,
      employee_id,
      assigned_by,
      assigned_at,
      returned_at,
      status,
      notes,
      created_at,
      updated_at
    FROM asset_assignments
    WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const getAssetAssignmentDetailById = async (id) => {
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
    WHERE asset_assignments.id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const createAssetAssignmentWithTransaction = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertSql = `INSERT INTO asset_assignments
    (asset_id, employee_id, assigned_by, notes) VALUES (?, ?, ?, ?)`;
    const insertValues = [
      data.asset_id,
      data.employee_id,
      data.assigned_by,
      data.notes || null,
    ];
    const [assignmentResult] = await connection.query(insertSql, insertValues);

    const updateSql = `UPDATE assets 
    SET status = 'assigned' WHERE id = ?`;
    await connection.query(updateSql, [data.asset_id]);

    await connection.commit();

    return assignmentResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const returnAssetAssignmentWithTransaction = async (assignmentId, assetId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const updateAssignmentSql = `UPDATE asset_assignments 
      SET status = 'returned', returned_at = current_timestamp
      WHERE id = ?`;
    const [assignmentResult] = await connection.query(updateAssignmentSql, [
      assignmentId,
    ]);

    const updateAssetSql = `UPDATE assets 
    SET status = 'available' WHERE id = ?`;
    await connection.query(updateAssetSql, [assetId]);

    await connection.commit();

    return assignmentResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAssetAssignments,
  getAssetAssignmentById,
  getAssetAssignmentDetailById,
  createAssetAssignmentWithTransaction,
  returnAssetAssignmentWithTransaction,
};
