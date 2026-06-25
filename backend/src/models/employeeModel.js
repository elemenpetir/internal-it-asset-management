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

const createEmployee = async ({
  name,
  email,
  employee_number,
  department_id,
  position,
}) => {
  const sql = `INSERT INTO employees (name, email, employee_number, department_id, position, status)
    VALUES (?, ?, ?, ?, ?, 'active')`;
  const [result] = await db.query(sql, [
    name,
    email,
    employee_number,
    department_id,
    position,
  ]);
  return result.insertId;
};

const updateEmployee = async (
  id,
  { name, email, position, department_id, status },
) => {
  const sql = `UPDATE employees SET name = ?, email = ?, position = ?, department_id = ?, status = ?
    WHERE id = ?`;
  const [result] = await db.query(sql, [
    name,
    email,
    position,
    department_id,
    status,
    id,
  ]);
  return result.affectedRows;
};

const deleteEmployee = async (id) => {
  const sql = `UPDATE employees SET status = 'inactive' WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
};

module.exports = {
  findEmployeeById,
  getEmployeeByUserId,
  getActiveEmployees,
  getEmployeeByEmployeeNumber,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};