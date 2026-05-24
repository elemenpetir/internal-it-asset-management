const db = require('../config/db')

const getAssetCategories = async() => {
    const sql = 'SELECT * FROM asset_categories ORDER BY name ASC'
    const [rows] = await db.query(sql)
    return rows
}

const createAssetCategory = async (name) => {
    const sql = 'INSERT INTO asset_categories (name) VALUES (?)'
    const [result] = await db.query(sql, [name])
    return result
}

module.exports = {
    getAssetCategories,
    createAssetCategory
}