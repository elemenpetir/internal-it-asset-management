const db = require('../config/db');

const getAuditLogs = async () => {
    const sql = `SELECT 
      audit_logs.id,
      audit_logs.entity_type,
      audit_logs.entity_id,
      audit_logs.action,
      audit_logs.old_value,
      audit_logs.new_value,
      audit_logs.changed_by,
      users.name AS changed_by_name,
      audit_logs.created_at
    FROM audit_logs
    JOIN users ON audit_logs.changed_by = users.id
    ORDER BY audit_logs.id DESC`
    const [rows] = await db.query(sql)
    return rows
}

module.exports = {
    getAuditLogs,
}