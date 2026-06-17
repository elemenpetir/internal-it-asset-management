const db = require("../config/db");

const getAllMaintenanceRequest = async () => {
  const sql = `SELECT 
        maintenance_requests.id,
        maintenance_requests.asset_id,
        assets.name AS asset_name,
        assets.asset_code,
        maintenance_requests.requested_by,
        employees.name AS requested_by_name,
        employees.employee_number,
        maintenance_requests.issue_description,
        maintenance_requests.status,
        maintenance_requests.handled_by,
        users.name AS handled_by_name,
        maintenance_requests.resolution_note,
        maintenance_requests.created_at,
        maintenance_requests.updated_at,
        maintenance_requests.completed_at
    FROM maintenance_requests
    JOIN assets ON maintenance_requests.asset_id = assets.id
    JOIN employees ON maintenance_requests.requested_by = employees.id
    LEFT JOIN users ON maintenance_requests.handled_by = users.id
    ORDER BY maintenance_requests.id DESC`;

  const [rows] = await db.query(sql);
  return rows;
};

const getMaintenanceRequestById = async (id) => {
  const sql = `SELECT 
        maintenance_requests.id,
        maintenance_requests.asset_id,
        assets.name AS asset_name,
        maintenance_requests.requested_by,
        employees.name AS requested_by_name,
        maintenance_requests.issue_description,
        maintenance_requests.status,
        maintenance_requests.handled_by,
        users.name AS handled_by_name,
        maintenance_requests.resolution_note,
        maintenance_requests.created_at,
        maintenance_requests.updated_at,
        maintenance_requests.completed_at
    FROM maintenance_requests
    JOIN assets ON maintenance_requests.asset_id = assets.id
    JOIN employees ON maintenance_requests.requested_by = employees.id
    LEFT JOIN users ON maintenance_requests.handled_by = users.id
    WHERE maintenance_requests.id = ?`;

  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const getMaintenanceRequestsByEmployeeId = async (employee_id) => {
  const sql = `SELECT maintenance_requests.id,
      maintenance_requests.asset_id,
      assets.name AS asset_name,
      maintenance_requests.requested_by,
      employees.name AS requested_by_name,
      maintenance_requests.issue_description,
      maintenance_requests.status,
      maintenance_requests.handled_by,
      users.name AS handled_by_name,
      maintenance_requests.resolution_note,
      maintenance_requests.created_at,
      maintenance_requests.updated_at,
      maintenance_requests.completed_at
    FROM maintenance_requests
    JOIN assets ON maintenance_requests.asset_id = assets.id
    JOIN employees ON maintenance_requests.requested_by = employees.id
    LEFT JOIN users ON maintenance_requests.handled_by = users.id
    WHERE maintenance_requests.requested_by = ?
    ORDER BY maintenance_requests.id DESC`;
  const [rows] = await db.query(sql, [employee_id]);
  return rows;
};

const getActiveMaintenanceRequestByAssetId = async (asset_id) => {
  const sql = `SELECT id FROM maintenance_requests 
    WHERE asset_id = ? 
    AND status IN ('reported', 'in_progress')`;
  const [rows] = await db.query(sql, [asset_id]);
  return rows[0];
};

const createMaintenanceRequestWithTransaction = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertSql = `INSERT INTO maintenance_requests
    (asset_id, requested_by, issue_description) VALUES (?, ?, ?)`;
    const insertValues = [
      data.asset_id,
      data.requested_by,
      data.issue_description,
    ];
    const [maintenanceRequestResult] = await connection.query(
      insertSql,
      insertValues,
    );

    const auditSql = `INSERT INTO audit_logs
      (entity_type, entity_id, action, old_value, new_value, changed_by)
      VALUES (?, ?, ?, ?, ?, ?)`;
    await connection.query(auditSql, [
      "maintenance_requests",
      maintenanceRequestResult.insertId,
      "MAINTENANCE_CREATED",
      null,
      JSON.stringify({
        asset_id: data.asset_id,
        requested_by: data.requested_by,
        issue_description: data.issue_description,
        status: "reported",
      }),
      data.requested_by,
    ]);

    await connection.commit();

    return maintenanceRequestResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateMaintenanceRequestStatusWithTransaction = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let updateFields = "status = ?";
    let updateValues = [data.status];

    if (data.status === "in_progress") {
      updateFields += ", handled_by = ?";
      updateValues.push(data.handled_by);
    }

    if (data.status === "completed") {
      updateFields += ", resolution_note = ?, completed_at = CURRENT_TIMESTAMP";
      updateValues.push(data.resolution_note);
    }

    updateValues.push(data.id);

    const [currentData] = await connection.query(
      "SELECT status FROM maintenance_requests WHERE id = ?",
      [data.id],
    );
    const old_status = currentData[0].status;

    const updateSql = `UPDATE maintenance_requests SET ${updateFields} WHERE id = ?`;
    const [updateMaintenanceRequestResult] = await connection.query(
      updateSql,
      updateValues,
    );

    const auditSql = `INSERT INTO audit_logs
      (entity_type, entity_id, action, old_value, new_value, changed_by)
      VALUES (?, ?, ?, ?, ?, ?)`;
    await connection.query(auditSql, [
      "maintenance_requests",
      data.id,
      "UPDATE_STATUS",
      JSON.stringify({ status: old_status }),
      JSON.stringify({ status: data.status }),
      data.handled_by,
    ]);

    await connection.commit();

    return updateMaintenanceRequestResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllMaintenanceRequest,
  getMaintenanceRequestById,
  getMaintenanceRequestsByEmployeeId,
  getActiveMaintenanceRequestByAssetId,
  createMaintenanceRequestWithTransaction,
  updateMaintenanceRequestStatusWithTransaction,
};
