const employeeModel = require("../models/employeeModel");

const getEmployees = async (req, res, next) => {
  try {
    const rows = await employeeModel.getActiveEmployees();
    return res.status(200).json({
      status: "success",
      message: "get all employees successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findEmployeeById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ status: "failed", message: "Employee not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "get employee detail successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, employee_number, department_id, position } = req.body;

    if (!name || !email || !employee_number || !department_id || !position) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    const insertId = await employeeModel.createEmployee({
      name,
      email,
      employee_number,
      department_id,
      position,
    });
    const employee = await employeeModel.findEmployeeById(insertId);

    return res.status(201).json({
      status: "success",
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, position, department_id, status } = req.body;

    const existing = await employeeModel.findEmployeeById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "failed", message: "Employee not found" });
    }

    if (!name || !email || !position || !department_id || !status) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    await employeeModel.updateEmployee(id, {
      name,
      email,
      position,
      department_id,
      status,
    });
    const updated = await employeeModel.findEmployeeById(id);

    return res.status(200).json({
      status: "success",
      message: "Employee updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await employeeModel.findEmployeeById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "failed", message: "Employee not found" });
    }

    await employeeModel.deleteEmployee(id);

    return res.status(200).json({
      status: "success",
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeDetail,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
