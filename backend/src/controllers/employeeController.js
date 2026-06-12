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

module.exports = {
  getEmployees,
};