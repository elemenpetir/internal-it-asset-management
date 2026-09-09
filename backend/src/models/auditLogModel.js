const db = require('../config/db');

const getAuditLogs = async () => {
    const sql = `SELECT 
      audit_logs.id,
      audit_logs.entity_type,
      audit_logs.entity_id,
      CASE
        WHEN audit_logs.entity_type = 'asset' THEN CONCAT(direct_asset.asset_code, ' (', direct_asset.name, ')')
        WHEN audit_logs.entity_type = 'asset_assignment' THEN CONCAT(assign_asset.asset_code, ' / ', assign_emp.name)
        WHEN audit_logs.entity_type = 'maintenance_requests' THEN CONCAT(maint_asset.asset_code, ' (', maint_asset.name, ')')
        ELSE NULL
      END AS entity_label,
      audit_logs.action,
      audit_logs.old_value,
      audit_logs.new_value,
      audit_logs.changed_by,
      users.name AS changed_by_name,
      audit_logs.created_at
    FROM audit_logs
    JOIN users ON audit_logs.changed_by = users.id
    LEFT JOIN assets AS direct_asset ON audit_logs.entity_type = 'asset' AND audit_logs.entity_id = direct_asset.id
    LEFT JOIN asset_assignments AS lbl_assign ON audit_logs.entity_type = 'asset_assignment' AND audit_logs.entity_id = lbl_assign.id
    LEFT JOIN assets AS assign_asset ON assign_asset.id = lbl_assign.asset_id
    LEFT JOIN employees AS assign_emp ON assign_emp.id = lbl_assign.employee_id
    LEFT JOIN maintenance_requests AS lbl_maint ON audit_logs.entity_type = 'maintenance_requests' AND audit_logs.entity_id = lbl_maint.id
    LEFT JOIN assets AS maint_asset ON maint_asset.id = lbl_maint.asset_id
    ORDER BY audit_logs.id DESC`
    const [rows] = await db.query(sql)
    return rows
}

module.exports = {
    getAuditLogs,
}