const db = require("../config/db");

const findUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await db.query(sql, [email]);
  return rows[0];
};

const findEmployeeForActivation = async (email, employeeNum) => {
  const sql = `SELECT * FROM employees WHERE email = ? AND employee_number = ?`;
  const values = [email, employeeNum];
  const [rows] = await db.query(sql, values);
  return rows[0];
};

const activateEmployeeWithTransaction = async (employeeId, userData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const createUserSql =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const userValues = [
      userData.name,
      userData.email,
      userData.password,
      userData.role,
    ];
    const [userResult] = await connection.query(createUserSql, userValues);

    const updateEmployeeSql = "UPDATE employees SET user_id = ? WHERE id = ?";
    const employeeValues = [userResult.insertId, employeeId];
    await connection.query(updateEmployeeSql, employeeValues);

    await connection.commit();

    return userResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  findUserByEmail,
  findEmployeeForActivation,
  activateEmployeeWithTransaction,
};
