const db = require("../config/db");

const getAllDepartments = async () => {
  const sql = `SELECT id, name, created_at FROM departments ORDER BY name ASC`;
  const [rows] = await db.query(sql);
  return rows;
};

const findDepartmentById = async (id) => {
  const sql = `SELECT id, name, created_at FROM departments WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const createDepartment = async (name) => {
  const sql = `INSERT INTO departments (name) VALUES (?)`;
  const [result] = await db.query(sql, [name]);
  return result.insertId;
};

const updateDepartment = async (id, name) => {
  const sql = `UPDATE departments SET name = ? WHERE id = ?`;
  const [result] = await db.query(sql, [name, id]);
  return result.affectedRows;
};

const deleteDepartment = async (id) => {
  const sql = `DELETE FROM departments WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllDepartments,
  findDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};