const db = require('../config/db')

const findUserByEmail = async(email) => {
    const sql = `SELECT * FROM users WHERE email = ?`
    const [rows] = await db.query(sql, [email])
    return rows[0]
}

const findEmployeeForActivation = async(email, employeeNum) => {
    const sql = `SELECT * FROM employees WHERE email = ? AND employee_number = ?`
    const values = [email, employeeNum]
    const [rows] = await db.query(sql, values)
    return rows[0]
}

const createUserForEmployeeActivation = async (data) => {
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    const values = [data.name, data.email, data.password, data.role]
    const [results] = await db.query(sql, values)
    return results
}

const linkEmployeeToUser = async(employeeId, userId) => {
    const sql = 'UPDATE employees SET user_id = ? WHERE id = ?'
    const values = [userId, employeeId]
    const [results] = await db.query(sql, values)
    return results
}

module.exports = {
    findUserByEmail,
    findEmployeeForActivation,
    createUserForEmployeeActivation,
    linkEmployeeToUser
}