const db = require('../config/db')

const findEmployeeById = async (id) => {
    const sql = `SELECT id, name, email, employee_number, department_id, position, status
    FROM employees WHERE id = ?`
    const [rows] = await db.query(sql, [id])
    return rows[0]
}

module.exports = {
    findEmployeeById
}