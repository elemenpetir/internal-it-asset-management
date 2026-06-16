const db = require("../config/db");

const findEmployeeById = async (id) => {
  const sql = `SELECT id, name, email, employee_number, department_id, position, status
    FROM employees WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const getEmployeeByUserId = async (user_id) => {
  const sql = `SELECT id FROM employees WHERE user_id = ?`;
  const [rows] = await db.query(sql, [user_id]);
  return rows[0];
};

const getEmployeeByEmployeeNumber = async (employee_number) => {
  const sql = `SELECT id FROM employees WHERE employee_number = ?`;
  const [rows] = await db.query(sql, [employee_number]);
  return rows[0];
};

const getActiveEmployees = async () => {
  const sql = `SELECT 
    id,
    name,
    email,
    employee_number,
    department_id,
    position,
    status
    FROM employees
    WHERE status = 'active'
    ORDER BY name ASC`;

  const [rows] = await db.query(sql);
  return rows;
};

module.exports = {
  findEmployeeById,
  getEmployeeByUserId,
  getActiveEmployees,
  getEmployeeByEmployeeNumber,
};
