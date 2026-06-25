const departmentModel = require("../models/departmentModel");

const getDepartments = async (req, res, next) => {
  try {
    const rows = await departmentModel.getAllDepartments();
    return res.status(200).json({
      status: "success",
      message: "get all departments successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ status: "failed", message: "Name is required" });
    }
    const insertId = await departmentModel.createDepartment(name);
    const department = await departmentModel.findDepartmentById(insertId);
    return res.status(201).json({
      status: "success",
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await departmentModel.findDepartmentById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "failed", message: "Department not found" });
    }
    if (!name) {
      return res
        .status(400)
        .json({ status: "failed", message: "Name is required" });
    }

    await departmentModel.updateDepartment(id, name);
    const updated = await departmentModel.findDepartmentById(id);
    return res.status(200).json({
      status: "success",
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await departmentModel.findDepartmentById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "failed", message: "Department not found" });
    }
    await departmentModel.deleteDepartment(id);
    return res.status(200).json({
      status: "success",
      message: "Department deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
