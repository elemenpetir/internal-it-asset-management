const db = require('../config/db');

const createAuditLog = async (data) => {
    const sql = `INSERT INTO audit_logs
    (entity_type, entity_id, action, old_value, new_value, changed_by)
    VALUES (?, ?, ?, ?, ?, ?)`
    const values = [
        data.entity_type,
        data.entity_id,
        data.action,
        data.old_value ? JSON.stringify(data.old_value) : null,
        data.new_value ? JSON.stringify(data.new_value) : null,
        data.changed_by
    ]
    const [result] = await db.query(sql, values)
    return result
}

module.exports = {
    createAuditLog,
}