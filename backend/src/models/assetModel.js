const db = require("../config/db");

const getAssets = async ({
  status,
  category_id,
  department_id,
  search,
  page = 1,
  limit = 10,
} = {}) => {
  let sql = `SELECT assets.id, 
      assets.asset_code, 
      assets.name, 
      assets.category_id, 
      asset_categories.name AS category_name, 
      assets.brand,
      assets.model,
      assets.serial_number,
      DATE_FORMAT(assets.purchase_date, '%Y-%m-%d') AS purchase_date,
      assets.status,
      assets.location,
      assets.notes,
      assets.created_at,
      assets.updated_at
    FROM assets
    JOIN asset_categories ON asset_categories.id = assets.category_id
    LEFT JOIN asset_assignments ON asset_assignments.asset_id = assets.id 
      AND asset_assignments.status = 'active'
    LEFT JOIN employees ON employees.id = asset_assignments.employee_id`;

  const conditions = [];
  const values = [];

  if (status) {
    conditions.push("assets.status = ?");
    values.push(status);
  }

  if (category_id) {
    conditions.push("assets.category_id = ?");
    values.push(category_id);
  }

  if (department_id) {
    conditions.push("employees.department_id = ?");
    values.push(department_id);
  }

  if (search) {
    conditions.push(
      "(assets.asset_code LIKE ? OR assets.name LIKE ? OR assets.brand LIKE ? OR assets.serial_number LIKE ?)",
    );
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword, keyword);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY assets.id DESC";

  const offset = (page - 1) * limit;
  sql += " LIMIT ? OFFSET ?";
  values.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, values);
  return rows;
};

const countAssets = async ({
  status,
  category_id,
  department_id,
  search,
} = {}) => {
  let sql = `SELECT COUNT(*) as total FROM assets
    JOIN asset_categories ON asset_categories.id = assets.category_id
    LEFT JOIN asset_assignments ON asset_assignments.asset_id = assets.id
      AND asset_assignments.status = 'active'
    LEFT JOIN employees ON employees.id = asset_assignments.employee_id`;

  const conditions = [];
  const values = [];

  if (status) {
    conditions.push("assets.status = ?");
    values.push(status);
  }

  if (category_id) {
    conditions.push("assets.category_id = ?");
    values.push(category_id);
  }

  if (department_id) {
    conditions.push("employees.department_id = ?");
    values.push(department_id);
  }

  if (search) {
    conditions.push(
      "(assets.asset_code LIKE ? OR assets.name LIKE ? OR assets.brand LIKE ? OR assets.serial_number LIKE ?)",
    );
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword, keyword);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  const [rows] = await db.query(sql, values);
  return rows[0].total;
};

const getAssetById = async (id) => {
  const sql = `SELECT assets.id, 
      assets.asset_code, 
      assets.name, 
      assets.category_id, 
      asset_categories.name AS category_name, 
      assets.brand,
      assets.model,
      assets.serial_number,
      DATE_FORMAT(assets.purchase_date, '%Y-%m-%d') AS purchase_date,
      assets.status,
      assets.location,
      assets.notes,
      assets.created_at,
      assets.updated_at
    FROM assets 
    JOIN asset_categories ON asset_categories.id = assets.category_id
    WHERE assets.id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const createAssetWithAuditLog = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertAssetSql = `INSERT INTO assets
    (asset_code, name, category_id, brand, model, serial_number, purchase_date, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const valuesAsset = [
      data.asset_code,
      data.name,
      data.category_id,
      data.brand,
      data.model,
      data.serial_number,
      data.purchase_date,
      data.location,
      data.notes || null,
    ];
    const [assetResult] = await connection.query(insertAssetSql, valuesAsset);

    const insertAuditLogSql = `INSERT INTO audit_logs
    (entity_type, entity_id, action, old_value, new_value, changed_by)
    VALUES (?, ?, ?, ?, ?, ?)`;
    const auditLogValues = [
      "asset",
      assetResult.insertId,
      "CREATE_ASSET",
      null,
      JSON.stringify({
        asset_code: data.asset_code,
        name: data.name,
        category_id: data.category_id,
        brand: data.brand,
        model: data.model,
        serial_number: data.serial_number,
        purchase_date: data.purchase_date,
        location: data.location,
        notes: data.notes || null,
      }),
      data.changed_by,
    ];
    await connection.query(insertAuditLogSql, auditLogValues);

    await connection.commit();

    return assetResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateAssetWithAuditLog = async (id, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [oldRows] = await connection.query(
      `SELECT 
        id,
        asset_code,
        name,
        category_id,
        brand,
        model,
        serial_number,
        purchase_date,
        status,
        location,
        notes
      FROM assets
      WHERE id = ?`,
      [id],
    );
    const oldAsset = oldRows[0];
    if (!oldAsset) {
      await connection.rollback();
      return null;
    }

    const updateSql = `UPDATE assets SET
      asset_code = ?, 
      name = ?, 
      category_id = ?, 
      brand = ?, 
      model = ?, 
      serial_number = ?, 
      purchase_date = ?, 
      location = ?, 
      notes = ?
      WHERE id = ?`;
    const updateValues = [
      data.asset_code,
      data.name,
      data.category_id,
      data.brand,
      data.model,
      data.serial_number,
      data.purchase_date,
      data.location,
      data.notes || null,
      id,
    ];
    const [resultUpdate] = await connection.query(updateSql, updateValues);

    const auditSql = `INSERT INTO audit_logs
      (entity_type, entity_id, action, old_value, new_value, changed_by)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const newValue = {
      asset_code: data.asset_code,
      name: data.name,
      category_id: data.category_id,
      brand: data.brand,
      model: data.model,
      serial_number: data.serial_number,
      purchase_date: data.purchase_date,
      location: data.location,
      notes: data.notes || null,
    };
    await connection.query(auditSql, [
      "asset",
      id,
      "UPDATE_ASSET",
      JSON.stringify(oldAsset),
      JSON.stringify(newValue),
      data.changed_by,
    ]);

    await connection.commit();

    return resultUpdate;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateAssetStatusWithAuditLog = async (id, status, changedBy) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [oldRows] = await connection.query(
      `SELECT 
        id,
        asset_code,
        name,
        status
      FROM assets
      WHERE id = ?`,
      [id],
    );

    const oldAsset = oldRows[0];

    if (!oldAsset) {
      await connection.rollback();
      return null;
    }

    const updateSql = `UPDATE assets SET
      status = ?
      WHERE id = ?`;

    const [resultUpdate] = await connection.query(updateSql, [status, id]);

    const auditSql = `INSERT INTO audit_logs
      (entity_type, entity_id, action, old_value, new_value, changed_by)
      VALUES (?, ?, ?, ?, ?, ?)`;

    await connection.query(auditSql, [
      "asset",
      id,
      "UPDATE_ASSET_STATUS",
      JSON.stringify({
        status: oldAsset.status,
      }),
      JSON.stringify({
        status,
      }),
      changedBy,
    ]);

    await connection.commit();

    return resultUpdate;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAssetWithAuditLog,
  updateAssetWithAuditLog,
  updateAssetStatusWithAuditLog,
  countAssets,
};
