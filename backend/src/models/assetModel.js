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
    data.notes || null
  ];

  const [result] = await db.query(sql, values)
  return result
};

module.exports = {
  getAssets,
  createAsset,
};
