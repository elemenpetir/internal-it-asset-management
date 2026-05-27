const db = require("../config/db");

const getAssets = async () => {
  const sql = `SELECT assets.id, 
    assets.asset_code, 
    assets.name, 
    assets.category_id, 
    asset_categories.name AS category_name, 
    assets.brand,
    assets.model,
    assets.serial_number,
    assets.purchase_date,
    assets.status,
    assets.location,
    assets.notes,
    assets.created_at,
    assets.updated_at
    FROM assets
    JOIN asset_categories ON asset_categories.id = assets.category_id
    ORDER BY assets.id DESC`;

  const [rows] = await db.query(sql);
  return rows;
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
    assets.purchase_date,
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

const createAsset = async (data) => {
  const sql = `INSERT INTO assets
    (asset_code, name, category_id, brand, model, serial_number, purchase_date, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
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

  const [result] = await db.query(sql, values);
  return result;
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
    await connection.query(insertAuditLogSql, auditLogValues)

    await connection.commit()

    return assetResult
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
};

const updateAsset = async (id, data) => {
  const sql = `UPDATE assets SET
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
  const values = [
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

  const [result] = await db.query(sql, values);
  return result;
};

const updateStatus = async (id, status) => {
  const sql = `UPDATE assets SET
    status = ? WHERE id = ?`;
  const values = [status, id];
  const [result] = await db.query(sql, values);
  return result;
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  createAssetWithAuditLog,
  updateAsset,
  updateStatus,
};
